import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from './exceptions'
import { handleExceptions } from './exception-handler'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

export type NextasticRequest<
  TBody = unknown,
  TQuery = unknown,
  TExpectsFormData = unknown,
  TRouteParams = unknown,
> = {
  body: TBody extends z.ZodObject<any>
    ? TExpectsFormData extends true
      ? FormData
      : z.infer<TBody>
    : null
  headers: NextRequest['headers']
  cookies: NextRequest['cookies']
  nextUrl: NextRequest['nextUrl']
  query: TQuery extends z.ZodObject<any> ? z.infer<TQuery> : null
  routeParams: TRouteParams extends z.ZodObject<any>
    ? z.infer<TRouteParams>
    : null
}

export const buildRoute = <
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
>(config: {
  body?: TBody
  isFormData?: TExpectsFormData
  query?: TQuery
  routeParams?: TRouteParams
  response?: TResponse
}) => {
  return new RouteBuilder<
    NextasticRequest<TBody, TQuery, TExpectsFormData, TRouteParams>,
    TResponse
  >(
    {
      body: config.body,
      isFormData: config.isFormData,
      query: config.query,
      routeParams: config.routeParams,
    },
    config.response,
  )
}

export type Middleware<TInput, TOutput> = (
  input: TInput,
) => TOutput | NextResponse | Promise<TOutput | NextResponse>

export class RouteBuilder<
  TRequest extends NextasticRequest<any, any, any, any>,
  TResponse,
> {
  constructor(
    private config: {
      body?: any
      isFormData?: any
      query?: any
      routeParams?: any
    },
    private response: TResponse | undefined,
    private middlewares: Middleware<any, any>[] = [],
  ) {}

  use<NewTRequest extends NextasticRequest<any, any, any, any>>(
    middleware: Middleware<TRequest, NewTRequest>,
  ): RouteBuilder<NewTRequest, TResponse> {
    this.middlewares.push(middleware)
    return this as any
  }

  handle(
    handler: (
      req: TRequest,
    ) => TResponse extends z.ZodObject<any>
      ? Promise<NextResponse<z.infer<TResponse>>>
      : Promise<NextResponse<Record<PropertyKey, never>>>,
  ): (
    request: NextRequest,
    options: { params: Promise<Record<string, string>> },
  ) => Promise<NextResponse> {
    return async (req, options) => {
      return handleExceptions(async () => {
        try {
          const params = await options.params

          const data = this.config.body as z.ZodObject<any> | undefined
          const body = (await parseBody(data, req)) as any

          const requiredQueryParams = this.config.query as
            | z.ZodObject<any>
            | undefined
          const queryParams = Object.fromEntries(req.nextUrl.searchParams)
          const query = (await parseQuery(
            requiredQueryParams,
            queryParams,
          )) as any

          const requiredRouteParams = this.config.routeParams as
            | z.ZodObject<any>
            | undefined
          const routeParams = (await parseRouteParams(
            requiredRouteParams,
            params,
          )) as any

          let nextRequest = {
            body,
            cookies: req.cookies,
            nextUrl: req.nextUrl,
            query,
            routeParams,
            headers: req.headers,
          }
          for (const middleware of this.middlewares) {
            const middlewareResult = await middleware(nextRequest)

            if (middlewareResult instanceof NextResponse) {
              return middlewareResult
            }

            nextRequest = middlewareResult
          }

          const response = await handler(nextRequest as any)

          const jsonBody = this.response as z.ZodObject<any> | undefined
          if (!jsonBody) {
            return response as unknown as Promise<
              NextResponse<Record<PropertyKey, never>>
            >
          }

          try {
            jsonBody.parse(await response.clone().json()) // Clone to avoid already read response error
            return response as unknown as NextResponse<TResponse>
          } catch (error: unknown) {
            if (error instanceof ZodError) {
              throw new InternalServerErrorException({
                type: 'unknown_response',
                message: createZodErrorMessage(error),
                errors: error.format(),
              })
            }

            return response
          }
        } catch (error: unknown) {
          if (error instanceof HttpException) {
            return NextResponse.json(error.metadata, { status: error.status })
          }

          if (error instanceof Error) {
            return NextResponse.json(
              {
                type: 'server_error',
                message: 'Unknown server error',
                stack_trace: error.stack?.split('\n'),
                data: 'data' in error ? error.data : null,
              },
              { status: 500 },
            )
          }

          throw error
        }
      })
    }
  }
}

async function parseBody<TBodyParams extends z.ZodObject<any>>(
  bodyParams: TBodyParams | undefined,
  request: NextRequest,
) {
  if (!bodyParams) {
    return null
  }

  try {
    const { data, formData } = await getData(request)

    try {
      if (formData) {
        bodyParams.parse(data)
        return formData
      }

      return bodyParams.parse(data)
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          type: 'invalid_data',
          message: createZodErrorMessage(error),
          errors: error.format(),
        })
      }

      throw error
    }
  } catch (error: unknown) {
    // Check by constructor name and message since instanceof doesn't work reliably
    // with errors from different JavaScript contexts (like undici)
    if (error?.constructor?.name === 'SyntaxError' && (error as any)?.message === 'Unexpected end of JSON input') {
      throw new BadRequestException({
        type: 'invalid_data',
        message: 'Body must not be empty',
      })
    }

    throw error
  }
}

async function getData(request: NextRequest) {
  try {
    const formData = await request.clone().formData()

    const object: Record<string, any> = {}

    for (const [key, value] of formData.entries()) {
      object[key] = value
    }

    return { data: object, formData }
  } catch {
    return { data: await request.clone().json() }
  }
}

function createZodErrorMessage(error: ZodError) {
  const numIssues = error.issues.length
  if (numIssues === 1) {
    return createMessageFromZodIssue(error.issues[0])
  }

  const messages = error.issues.map((issue) => createMessageFromZodIssue(issue))
  return `${numIssues} Input Errors: ` + messages.join(', ')
}

const createMessageFromZodIssue = (issue: z.ZodIssue) => {
  if (issue.path.join('.') === '') {
    return issue.message
  }
  if (issue.message === 'Required') {
    return `${issue.path.join('.')} is required`
  }
  return `${issue.message} for "${issue.path.join('.')}"`
}

async function parseQuery<TQueryParams extends z.ZodObject<any>>(
  queryParmas: TQueryParams | undefined,
  contextParams: Record<string, string> = {},
) {
  if (!queryParmas) {
    return null
  }

  try {
    return queryParmas.parse(contextParams)
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new NotFoundException({
        type: 'missing_query_param',
        message: createZodErrorMessage(error),
        errors: error.format(),
      })
    }

    throw error
  }
}

async function parseRouteParams<TRouteParams extends z.ZodObject<any>>(
  routeParams: TRouteParams | undefined,
  contextParams: Record<string, string>,
) {
  if (!routeParams) {
    return null
  }

  try {
    return routeParams.parse(contextParams)
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new NotFoundException({
        type: 'missing_route_param',
        message: createZodErrorMessage(error),
        errors: error.format(),
      })
    }

    throw error
  }
}

const f = buildRoute({
  body: z.object({ name: z.string() }),
})

f.use((req) => ({ ...req, name: 'John' })).use((req) => ({
  ...req,
}))
