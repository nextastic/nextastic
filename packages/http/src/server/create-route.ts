import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from './exceptions'
import { handleExceptions } from './exception-handler'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

export function createRoute<
  TBody,
  TQuery,
  TResponse,
  TExpectsFormData,
  TRouteParams
>(
  config: {
    body?: TBody
    isFormData?: TExpectsFormData
    query?: TQuery
    response?: TResponse
    routeParams?: TRouteParams
  },
  handleRequest: (request: {
    body: TBody extends z.AnyZodObject
      ? TExpectsFormData extends boolean
        ? FormData
        : z.infer<TBody>
      : null
    cookies: NextRequest['cookies']
    nextUrl: NextRequest['nextUrl']
    query: TQuery extends z.AnyZodObject ? z.infer<TQuery> : null
    routeParams: TRouteParams extends z.AnyZodObject
      ? z.infer<TRouteParams>
      : null
  }) => TResponse extends z.AnyZodObject
    ? Promise<NextResponse<z.infer<TResponse>>>
    : Promise<NextResponse<Record<PropertyKey, never>>>
) {
  return async (
    request: NextRequest,
    options: { params?: Record<string, string> } = {}
  ) => {
    return handleExceptions(async () => {
      const { params = {} } = options

      const data = config.body as z.AnyZodObject | undefined
      const body = (await parseBody(data, request)) as any

      const requiredQueryParams = config.query as z.AnyZodObject | undefined
      const queryParams = Object.fromEntries(request.nextUrl.searchParams)
      const query = (await parseQuery(requiredQueryParams, queryParams)) as any

      const requiredRouteParams = config.routeParams as
        | z.AnyZodObject
        | undefined
      const routeParams = (await parseRouteParams(
        requiredRouteParams,
        params
      )) as any

      const response = await handleRequest({
        body,
        cookies: request.cookies,
        nextUrl: request.nextUrl,
        query,
        routeParams,
      })

      const jsonBody = config.response as z.AnyZodObject | undefined
      if (!jsonBody) {
        return response as unknown as Promise<
          NextResponse<Record<PropertyKey, never>>
        >
      }

      try {
        jsonBody.parse(await response.clone().json()) // Clone to avoid already read response error
        return response as unknown as NextResponse<TResponse>
      } catch (error: unknown) {
        if (isZodError(error)) {
          throw new InternalServerErrorException({
            type: 'unknown_response',
            message: createZodErrorMessage(error),
            errors: error.format(),
          })
        }

        return response
      }
    })
  }
}

async function parseBody<TBodyParams extends z.AnyZodObject>(
  bodyParams: TBodyParams | undefined,
  request: NextRequest
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
    if (isZodError(error)) {
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

async function parseQuery<TQueryParams extends z.AnyZodObject>(
  queryParmas: TQueryParams | undefined,
  contextParams: Record<string, string> = {}
) {
  if (!queryParmas) {
    return null
  }

  try {
    return queryParmas.parse(contextParams)
  } catch (error: unknown) {
    if (isZodError(error)) {
      throw new NotFoundException({
        type: 'missing_query_param',
        message: createZodErrorMessage(error),
        errors: error.format(),
      })
    }

    throw error
  }
}

async function parseRouteParams<TRouteParams extends z.AnyZodObject>(
  routeParams: TRouteParams | undefined,
  contextParams: Record<string, string> = {}
) {
  if (!routeParams) {
    return null
  }

  try {
    return routeParams.parse(contextParams)
  } catch (error: unknown) {
    if (isZodError(error)) {
      throw new NotFoundException({
        type: 'missing_route_param',
        message: createZodErrorMessage(error),
        errors: error.format(),
      })
    }

    throw error
  }
}

function isZodError(error: unknown): error is ZodError {
  if (typeof error !== 'object') {
    return false
  }

  if (!error) {
    return false
  }

  if (!('constructor' in error)) {
    return false
  }

  return error.constructor.name === 'ZodError' && 'issues' in error
}
