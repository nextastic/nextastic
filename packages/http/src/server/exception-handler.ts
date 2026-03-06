import { HttpRequestException } from '../client/http-request-exception'
import { HttpException } from './exceptions'
import { NextResponse } from 'next/server'

export const handleExceptions = async (
  handler: () => Promise<NextResponse>
) => {
  try {
    return await handler()
  } catch (error: unknown) {
    if (error instanceof HttpRequestException) {
      console.error(`[handleExceptions] HttpRequestException (${error.statusCode}):`, error.message, error.data)
      return NextResponse.json(
        {
          type: 'bad_request',
          message: error.message,
          errors: error.data,
        },
        {
          status: error.statusCode,
        }
      )
    }

    if (error instanceof HttpException) {
      console.error(`[handleExceptions] HttpException (${error.status}):`, error.metadata)
      const { type, message, ...otherMetadata } = error.metadata
      return NextResponse.json(
        {
          type,
          message,
          ...otherMetadata,
        },
        {
          status: error.status,
        }
      )
    }

    console.error(`[handleExceptions] Unhandled error:`, error)
    return NextResponse.json(
      {
        type: 'internal_server_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    )
  }
}
