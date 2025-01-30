import { NextRequest, NextResponse } from 'next/server'
import { createRoute } from '../../src/server'
import { HttpException } from '../../src/server/exceptions'
import { z } from 'zod'

it('should handle basic GET request', async () => {
  const route = createRoute(
    {
      response: z.object({
        ok: z.boolean(),
      }),
    },
    async (req) => {
      expect(req.nextUrl.pathname).toEqual('/api/test')

      return NextResponse.json({
        ok: true,
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'GET',
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({ ok: true })
})

it('should handle POST request with JSON body', async () => {
  const route = createRoute(
    {
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
      response: z.object({
        success: z.boolean(),
      }),
    },
    async (req) => {
      expect(req.body).toEqual({
        name: 'John',
        age: 25,
      })
      return NextResponse.json({ success: true })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ name: 'John', age: 25 }),
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({ success: true })
})

it('should handle FormData request', async () => {
  const route = createRoute(
    {
      body: z.object({
        file: z.instanceof(File),
      }),
      isFormData: true,
      response: z.object({
        received: z.boolean(),
      }),
    },
    async (req) => {
      expect(req.body instanceof FormData).toBe(true)
      expect(req.body.get('file') instanceof File).toBe(true)
      return NextResponse.json({ received: true })
    },
  )

  const formData = new FormData()
  const file = new File(['test'], 'test.txt', { type: 'text/plain' })
  formData.append('file', file)

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: formData,
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({ received: true })
})

it('should throw BadRequestException for invalid JSON body', async () => {
  const route = createRoute(
    {
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
    },
    async () => {
      return NextResponse.json({})
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ name: 'John' }), // missing required age field
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({
    type: 'invalid_data',
    message: 'age is required',
    errors: expect.any(Object),
  })
  expect(res.status).toBe(400)
})

it('should handle query parameters', async () => {
  const route = createRoute(
    {
      query: z.object({
        search: z.string(),
        page: z.string().transform(Number),
      }),
      response: z.object({
        query: z.object({
          search: z.string(),
          page: z.number(),
        }),
      }),
    },
    async (req) => {
      return NextResponse.json({
        query: req.query,
      })
    },
  )

  const request = new NextRequest(
    'http://localhost/api/test?search=test&page=1',
  )

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({
    query: {
      search: 'test',
      page: 1,
    },
  })
})
