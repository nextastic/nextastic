import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from './exceptions'
import { handleExceptions } from './exception-handler'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

export type BaseRequest<
  TBody,
  TExpectsFormData = unknown,
  TQuery = unknown,
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

type Config<TBody, TExpectsFormData, TQuery, TRouteParams, TResponse> = {
  body?: TBody
  isFormData?: TExpectsFormData
  query?: TQuery
  response?: TResponse
  routeParams?: TRouteParams
}

export type MiddlewareFn<TInput, TOutput> = (
  req: TInput,
) => TOutput | NextResponse | Promise<TOutput | NextResponse>

type HandlerFn<TInput, TResponse> = (
  req: TInput,
) => TResponse extends z.ZodObject<any>
  ? Promise<NextResponse<z.infer<TResponse>>>
  : Promise<NextResponse<Record<PropertyKey, never>>>

class RouteBuilder<
  TBody,
  TExpectsFormData,
  TQuery,
  TRouteParams,
  TResponse,
  TCurrentRequest = BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>,
> {
  constructor(
    private config: Config<
      TBody,
      TExpectsFormData,
      TQuery,
      TRouteParams,
      TResponse
    >,
    private middleware?: MiddlewareFn<any, TCurrentRequest>,
  ) {}

  use<TNextRequest>(
    middleware: MiddlewareFn<TCurrentRequest, TNextRequest>,
  ): RouteBuilder<
    TBody,
    TExpectsFormData,
    TQuery,
    TRouteParams,
    TResponse,
    TNextRequest
  > {
    return new RouteBuilder<
      TBody,
      TExpectsFormData,
      TQuery,
      TRouteParams,
      TResponse,
      TNextRequest
    >(this.config, async (baseRequest: any) => {
      const currentRequest = this.middleware
        ? await this.middleware(baseRequest)
        : baseRequest

      if (currentRequest instanceof NextResponse) {
        return currentRequest
      }

      return await middleware(currentRequest)
    })
  }

  handle(
    handler: HandlerFn<TCurrentRequest, TResponse>,
  ): (
    request: NextRequest,
    options: { params: Promise<Record<string, string>> },
  ) => Promise<NextResponse> {
    return async (
      request: NextRequest,
      options: { params: Promise<Record<string, string>> },
    ) => {
      return handleExceptions(async () => {
        const { params } = options

        const data = this.config.body as z.ZodObject<any> | undefined
        const body = (await parseBody(data, request)) as any

        const requiredQueryParams = this.config.query as
          | z.ZodObject<any>
          | undefined
        const queryParams = Object.fromEntries(request.nextUrl.searchParams)
        const query = (await parseQuery(
          requiredQueryParams,
          queryParams,
        )) as any

        const requiredRouteParams = this.config.routeParams as
          | z.ZodObject<any>
          | undefined
        const routeParams = (await parseRouteParams(
          requiredRouteParams,
          await params,
        )) as any

        try {
          const baseRequest = {
            body,
            cookies: request.cookies,
            nextUrl: request.nextUrl,
            query,
            routeParams,
            headers: request.headers,
          }

          let finalRequest = baseRequest as any

          if (this.middleware) {
            const result = await this.middleware(finalRequest)

            if (result instanceof NextResponse) {
              return result
            }

            finalRequest = result
          }

          const response = await handler(finalRequest)

          const jsonBody = this.config.response as z.ZodObject<any> | undefined
          if (!jsonBody) {
            return response as unknown as Promise<
              NextResponse<Record<PropertyKey, never>>
            >
          }

          try {
            jsonBody.parse(await response.clone().json())
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
        } catch (error) {
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

export function buildRoute<
  TBody = undefined,
  TExpectsFormData = false,
  TQuery = undefined,
  TRouteParams = undefined,
  TResponse = undefined,
>(
  config: Config<TBody, TExpectsFormData, TQuery, TRouteParams, TResponse>,
): RouteBuilder<TBody, TExpectsFormData, TQuery, TRouteParams, TResponse> {
  return new RouteBuilder(config)
}

async function parseBody<TBodyParams extends z.ZodObject<any>>(
  bodyParams: TBodyParams | undefined,
  request: NextRequest,
) {
  if (!bodyParams) {
    return null
  }

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

    if (
      error instanceof SyntaxError &&
      error.message === 'Unexpected end of JSON input'
    ) {
      throw new BadRequestException({
        type: 'invalid_data',
        message: 'Invalid JSON',
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
