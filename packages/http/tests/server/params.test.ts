import { NextRequest, NextResponse } from 'next/server'
import { buildRoute } from '../../src/server'
import { z } from 'zod'

it('should handle URL parameters correctly', async () => {
  const route = buildRoute({
    routeParams: z.object({
      id: z.string(),
      slug: z.string(),
    }),
    response: z.object({
      params: z.object({
        id: z.string(),
        slug: z.string(),
      }),
    }),
  }).handle(async (req) => {
    return NextResponse.json({
      params: req.routeParams,
    })
  })

  const request = new NextRequest('http://localhost/api/posts/123/my-post')

  const res = await route(request, {
    params: Promise.resolve({ id: '123', slug: 'my-post' }),
  })

  expect(await res.json()).toEqual({
    params: {
      id: '123',
      slug: 'my-post',
    },
  })
})

it('should throw BadRequestException for invalid params', async () => {
  const route = buildRoute({
    routeParams: z.object({
      id: z.string().uuid(),
    }),
  }).handle(async () => {
    return NextResponse.json({})
  })

  const request = new NextRequest('http://localhost/api/posts/invalid-uuid')

  const res = await route(request, {
    params: Promise.resolve({ id: 'invalid-uuid' }),
  })

  expect(res.status).toBe(404)
  expect(await res.json()).toMatchObject({
    type: 'missing_route_param',
    errors: expect.any(Object),
  })
})

it('should handle combined params, query and body validation', async () => {
  const route = buildRoute({
    routeParams: z.object({
      id: z.string(),
    }),
    query: z.object({
      version: z.string(),
    }),
    body: z.object({
      data: z.string(),
    }),
    response: z.object({
      combined: z.object({
        id: z.string(),
        version: z.string(),
        data: z.string(),
      }),
    }),
  }).handle(async (req) => {
    return NextResponse.json({
      combined: {
        id: req.routeParams.id,
        version: req.query.version,
        data: req.body.data,
      },
    })
  })

  const request = new NextRequest('http://localhost/api/posts/123?version=v1', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' }),
  })

  const res = await route(request, {
    params: Promise.resolve({ id: '123' }),
  })

  expect(await res.json()).toEqual({
    combined: {
      id: '123',
      version: 'v1',
      data: 'test',
    },
  })
})
