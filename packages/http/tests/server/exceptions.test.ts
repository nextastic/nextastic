import { NextRequest, NextResponse } from 'next/server'
import { createRoute } from '../../src/server'
import {
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '../../src/server/exceptions'
import { z } from 'zod'

it('should handle custom HttpException', async () => {
  const route = createRoute(
    {
      response: z.any(),
    },
    async () => {
      throw new HttpException(422, {
        message: 'Custom error message',
        type: 'http_error',
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test')
  const res = await route(request, { params: Promise.resolve({}) })

  expect(res.status).toBe(422)

  expect(await res.json()).toMatchObject({
    message: 'Custom error message',
    type: 'http_error',
  })
})

it('should handle NotFoundException', async () => {
  const route = createRoute(
    {
      response: z.any(),
    },
    async () => {
      throw new NotFoundException({
        message: 'Resource not found',
        type: 'not_found',
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test')
  const res = await route(request, { params: Promise.resolve({}) })

  expect(res.status).toBe(404)
  expect(await res.json()).toMatchObject({
    message: 'Resource not found',
    type: 'not_found',
  })
})

it('should handle UnauthorizedException', async () => {
  const route = createRoute(
    {
      response: z.any(),
    },
    async () => {
      throw new UnauthorizedException()
    },
  )

  const request = new NextRequest('http://localhost/api/test')
  const res = await route(request, { params: Promise.resolve({}) })

  expect(res.status).toBe(401)
  expect(await res.json()).toMatchObject({
    message: 'Unauthorized.',
    type: 'unauthorized',
  })
})

it('should handle unexpected errors', async () => {
  const route = createRoute(
    {
      response: z.any(),
    },
    async () => {
      throw new Error('Unexpected error')
    },
  )

  const request = new NextRequest('http://localhost/api/test')
  const res = await route(request, { params: Promise.resolve({}) })

  expect(res.status).toBe(500)
  expect(await res.json()).toMatchObject({
    message: 'Unknown server error',
    type: 'server_error',
  })
})

it('should handle zod validation errors', async () => {
  const route = createRoute(
    {
      body: z.object({
        name: z.string(),
      }),
      response: z.any(),
    },
    async (req) => {
      return NextResponse.json({})
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({
      name: 123, // Invalid type for name
    }),
  })

  const res = await route(request, { params: Promise.resolve({}) })

  expect(res.status).toBe(400)
  expect(await res.json()).toMatchObject({
    message: 'Invalid input: expected string, received number for "name"',
    type: 'invalid_data',
    errors: {
      name: {
        _errors: ['Invalid input: expected string, received number'],
      },
    },
  })
})
