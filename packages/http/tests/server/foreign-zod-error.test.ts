import { NextRequest, NextResponse } from 'next/server'
import { buildRoute, handleUnknownRouteError } from '../../src/server/build-route'
import { z, ZodError } from 'zod'

class ForeignZodError extends Error {
  issues = [
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'undefined',
      path: ['custom_workout_id'],
      message: 'Required',
    },
  ]

  constructor() {
    super('Required')
    this.name = 'ZodError'
  }

  format() {
    return { _errors: [], custom_workout_id: { _errors: ['Required'] } }
  }
}

const alwaysThrowsForeignZodError = {
  parse() {
    throw new ForeignZodError()
  },
}

const post = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/workout_sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('zod errors from a foreign zod copy', () => {
  it('is not detectable by instanceof or constructor name', () => {
    const error = new ForeignZodError()
    expect(error instanceof ZodError).toBe(false)
    expect(error.constructor.name).not.toBe('ZodError')
  })

  it('returns 400 invalid_data when the body schema throws one', async () => {
    const route = buildRoute({ body: alwaysThrowsForeignZodError }).handle(async () =>
      NextResponse.json({}),
    )

    const response = await route(post({ type: 'split' }), {
      params: Promise.resolve({}),
    })

    expect(response.status).toBe(400)
    const responseBody = await response.json()
    expect(responseBody.type).toBe('invalid_data')
    expect(responseBody.message).toBe('custom_workout_id is required')
  })

  it('returns 404 missing_query_param when the query schema throws one', async () => {
    const route = buildRoute({ query: alwaysThrowsForeignZodError }).handle(async () =>
      NextResponse.json({}),
    )

    const response = await route(
      new NextRequest('http://localhost:3000/api/test?user_id=1'),
      { params: Promise.resolve({}) },
    )

    expect(response.status).toBe(404)
    expect((await response.json()).type).toBe('missing_query_param')
  })

  it('returns 404 missing_route_param when the route params schema throws one', async () => {
    const route = buildRoute({ routeParams: alwaysThrowsForeignZodError }).handle(
      async () => NextResponse.json({}),
    )

    const response = await route(
      new NextRequest('http://localhost:3000/api/test/1'),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(404)
    expect((await response.json()).type).toBe('missing_route_param')
  })

  it('returns 500 unknown_response when the response schema throws one', async () => {
    const route = buildRoute({ response: alwaysThrowsForeignZodError }).handle(async () =>
      NextResponse.json({}),
    )

    const response = await route(
      new NextRequest('http://localhost:3000/api/test'),
      { params: Promise.resolve({}) },
    )

    expect(response.status).toBe(500)
    expect((await response.json()).type).toBe('unknown_response')
  })
})

describe('handleUnknownRouteError', () => {
  it('reports handler errors with route context and still returns 500', async () => {
    const seen: { error: unknown; context: unknown }[] = []
    handleUnknownRouteError((error, context) => seen.push({ error, context }))

    const route = buildRoute({
      body: z.object({ type: z.string() }),
    }).handle(async () => {
      throw new Error('column "type" does not exist')
    })

    const response = await route(post({ type: 'split' }), {
      params: Promise.resolve({}),
    })

    expect(response.status).toBe(500)
    expect((await response.json()).type).toBe('server_error')
    expect(seen).toHaveLength(1)
    expect((seen[0].error as Error).message).toBe('column "type" does not exist')
    expect(seen[0].context).toEqual({
      method: 'POST',
      url: '/api/workout_sessions',
      query: {},
      route_params: {},
      is_form_data: false,
      route_step: 'handler',
    })
  })

  it('is not called for validation failures', async () => {
    const seen: unknown[] = []
    handleUnknownRouteError((error) => seen.push(error))

    const route = buildRoute({ body: alwaysThrowsForeignZodError }).handle(async () =>
      NextResponse.json({}),
    )
    await route(post({}), { params: Promise.resolve({}) })

    expect(seen).toHaveLength(0)
  })
})
