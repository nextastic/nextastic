import { createRoute } from '@nextastic/http'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const POST = createRoute(
  {
    // Strongly typed JSON body
    body: z.object({
      name: z.string().min(1),
    }),
    // Strongly typed responses
    response: z.object({
      message: z.string(),
    }),
  },
  async (request) => {
    const { name } = request.body

    return NextResponse.json({
      message: `hello, ${name}`,
    })
  }
)
