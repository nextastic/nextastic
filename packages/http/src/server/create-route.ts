import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from './exceptions'
import { handleExceptions } from './exception-handler'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

type Middleware<MInRequest = any, MOutRequest = any> = (
  req: MInRequest,
) => MOutRequest | NextResponse | Promise<MOutRequest | NextResponse>

type BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams> = {
  body: TBody extends z.ZodObject<any>
    ? TExpectsFormData extends boolean
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

// Overloads for different numbers of middlewares
export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares?: never
  },
  handleRequest: (
    request: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>
    ]
  },
  handleRequest: (
    request: M1,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>
    ]
  },
  handleRequest: (
    request: M2,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>
    ]
  },
  handleRequest: (
    request: M3,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>
    ]
  },
  handleRequest: (
    request: M4,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>
    ]
  },
  handleRequest: (
    request: M5,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>,
      (req: M5) => M6 | NextResponse | Promise<M6 | NextResponse>
    ]
  },
  handleRequest: (
    request: M6,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>,
      (req: M5) => M6 | NextResponse | Promise<M6 | NextResponse>,
      (req: M6) => M7 | NextResponse | Promise<M7 | NextResponse>
    ]
  },
  handleRequest: (
    request: M7,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
  M8,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>,
      (req: M5) => M6 | NextResponse | Promise<M6 | NextResponse>,
      (req: M6) => M7 | NextResponse | Promise<M7 | NextResponse>,
      (req: M7) => M8 | NextResponse | Promise<M8 | NextResponse>
    ]
  },
  handleRequest: (
    request: M8,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
  M8,
  M9,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>,
      (req: M5) => M6 | NextResponse | Promise<M6 | NextResponse>,
      (req: M6) => M7 | NextResponse | Promise<M7 | NextResponse>,
      (req: M7) => M8 | NextResponse | Promise<M8 | NextResponse>,
      (req: M8) => M9 | NextResponse | Promise<M9 | NextResponse>
    ]
  },
  handleRequest: (
    request: M9,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
  M8,
  M9,
  M10,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares: [
      (
        req: BaseRequest<TBody, TExpectsFormData, TQuery, TRouteParams>
      ) => M1 | NextResponse | Promise<M1 | NextResponse>,
      (req: M1) => M2 | NextResponse | Promise<M2 | NextResponse>,
      (req: M2) => M3 | NextResponse | Promise<M3 | NextResponse>,
      (req: M3) => M4 | NextResponse | Promise<M4 | NextResponse>,
      (req: M4) => M5 | NextResponse | Promise<M5 | NextResponse>,
      (req: M5) => M6 | NextResponse | Promise<M6 | NextResponse>,
      (req: M6) => M7 | NextResponse | Promise<M7 | NextResponse>,
      (req: M7) => M8 | NextResponse | Promise<M8 | NextResponse>,
      (req: M8) => M9 | NextResponse | Promise<M9 | NextResponse>,
      (req: M9) => M10 | NextResponse | Promise<M10 | NextResponse>
    ]
  },
  handleRequest: (
    request: M10,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
): (
  request: NextRequest,
  options: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams,
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
    middlewares?: Middleware<any, any>[]
  },
  handleRequest: (
    request: any,
  ) => TResponse extends z.ZodObject<any>
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>,
) {
  return async (
    request: NextRequest,
    options: { params: Promise<Record<string, string>> },
  ) => {
    return handleExceptions(async () => {
      const { params } = options

      const data = config.body as z.ZodObject<any> | undefined
      const body = (await parseBody(data, request)) as any

      const requiredQueryParams = config.query as z.ZodObject<any> | undefined
      const queryParams = Object.fromEntries(request.nextUrl.searchParams)
      const query = (await parseQuery(requiredQueryParams, queryParams)) as any

      const requiredRouteParams = config.routeParams as
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

        const middlewares = config.middlewares ?? []
        let finalRequest = baseRequest as any

        if (middlewares.length > 0) {
          for (const middleware of middlewares) {
            const result = await middleware(finalRequest)

            // If middleware returns a NextResponse, short-circuit and return it
            if (result instanceof NextResponse) {
              return result
            }

            finalRequest = result
          }
        }

        const response = await handleRequest(finalRequest)

        const jsonBody = config.response as z.ZodObject<any> | undefined
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
