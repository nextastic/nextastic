import { createRoute } from '@nextastic/http'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// export const POST = createRoute(
//   {
//     body: z.object({
//       name: z.string(),
//     }),
//   },
//   async (request) => {
//     // const {} = request
//     return NextResponse.json({
//       message: `hello`,
//     })
//   }
// )
