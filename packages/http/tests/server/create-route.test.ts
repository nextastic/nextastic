import { NextRequest, NextResponse } from 'next/server'
import { createRoute } from '../../src/server'
import { z } from 'zod'

type Middleware<TInRequest, TOutRequest> = (req: TInRequest) => TOutRequest

// Type-only tests for middleware typing
describe('TypeScript type checking', () => {
  it('should enforce correct types', () => {
    // Without middlewares, req should have base request type
    createRoute(
      {
        body: z.object({ name: z.string() }),
      },
      async (req) => {
        // @ts-expect-error - user property should not exist without middleware
        expect(req.user).toBeDefined()

        // These should work fine
        expect(req.body.name).toBe('string')
        expect(req.headers).toBeDefined()

        return NextResponse.json({})
      },
    )

    // With middlewares, req should have transformed type
    createRoute(
      {
        middlewares: [
          (req: {
            body: null
            headers: any
            cookies: any
            nextUrl: any
            query: null
            routeParams: null
          }) => ({
            ...req,
            user: { id: 'test' },
          }),
        ],
      },
      async (req) => {
        // This should work - middleware adds user
        expect(req.user.id).toBe('string')

        // @ts-expect-error - nonexistent property
        expect(req.nonexistent).toBeDefined()

        return NextResponse.json({})
      },
    )

    // Middleware type mismatch should error
    createRoute(
      {
        body: z.object({ name: z.string() }),
        middlewares: [
          // @ts-expect-error - middleware input type doesn't match base request
          (req: { different: string }) => ({ ...req, user: { id: 'test' } }),
        ],
      },
      async (req) => {
        return NextResponse.json({})
      },
    )
  })
})

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

it('should handle middleware chain', async () => {
  const route = createRoute(
    {
      body: z.object({
        name: z.string(),
      }),
      response: z.object({
        userId: z.string(),
      }),
      middlewares: [
        (req) => {
          const foo = {
            ...req,
            user: {
              id: 'user123',
            },
          }

          return foo
        },
      ],
    },
    async (req) => {
      expect(req.user.id).toBe('user123')

      return NextResponse.json({
        userId: req.user.id,
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ name: 'John' }),
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({
    userId: 'user123',
  })
})

it('should handle multiple middleware chain', async () => {
  type BaseReq = {
    body: { name: string }
    headers: any
    cookies: any
    nextUrl: any
    query: null
    routeParams: null
  }

  type WithUser = BaseReq & { user: { id: string } }
  type WithRole = WithUser & { role: string }
  type WithGreeting = WithRole & { greeting: string }

  const addUser: Middleware<BaseReq, WithUser> = (req) => ({
    ...req,
    user: { id: 'user456' },
  })

  const addRole: Middleware<WithUser, WithRole> = (req) => ({
    ...req,
    role: 'admin',
  })

  const addGreeting: Middleware<WithRole, WithGreeting> = (req) => ({
    ...req,
    greeting: `Hello ${req.body.name}`,
  })

  const route = createRoute(
    {
      body: z.object({
        name: z.string(),
      }),
      response: z.object({
        message: z.string(),
        userId: z.string(),
        role: z.string(),
      }),
      middlewares: [addUser, addRole, addGreeting] as const,
    },
    async (req) => {
      expect(req.user.id).toBe('user456')
      expect(req.role).toBe('admin')
      expect(req.greeting).toBe('Hello Jane')
      expect(req.body.name).toBe('Jane')

      return NextResponse.json({
        message: req.greeting,
        userId: req.user.id,
        role: req.role,
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ name: 'Jane' }),
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({
    message: 'Hello Jane',
    userId: 'user456',
    role: 'admin',
  })
})

it('should handle inline middleware without explicit types', async () => {
  const route = createRoute(
    {
      body: z.object({
        email: z.string().email(),
      }),
      response: z.object({
        welcome: z.string(),
        userEmail: z.string(),
        timestamp: z.number(),
      }),
      middlewares: [
        // Inline middleware 1: adds current user
        (req) => ({
          ...req,
          currentUser: {
            email: req.body.email,
            id: 'user789',
          },
        }),
        // Inline middleware 2: adds timestamp
        (req) => ({
          ...req,
          timestamp: Date.now(),
        }),
      ],
    },
    async (req) => {
      // TypeScript should infer these properties from the middleware chain
      expect(req.currentUser.email).toBe('test@example.com')
      expect(req.currentUser.id).toBe('user789')
      expect(typeof req.timestamp).toBe('number')
      expect(req.body.email).toBe('test@example.com')

      return NextResponse.json({
        welcome: `Welcome ${req.currentUser.email}!`,
        userEmail: req.currentUser.email,
        timestamp: req.timestamp,
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com' }),
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  const result = await res.json()
  expect(result.welcome).toBe('Welcome test@example.com!')
  expect(result.userEmail).toBe('test@example.com')
  expect(typeof result.timestamp).toBe('number')
})

it('should handle many middlewares (up to 10)', async () => {
  const route = createRoute(
    {
      body: z.object({ input: z.string() }),
      response: z.object({ result: z.string() }),
      middlewares: [
        (req) => ({ ...req, step1: 'a' }),
        (req) => ({ ...req, step2: req.step1 + 'b' }),
        (req) => ({ ...req, step3: req.step2 + 'c' }),
        (req) => ({ ...req, step4: req.step3 + 'd' }),
        (req) => ({ ...req, step5: req.step4 + 'e' }),
        (req) => ({ ...req, final: `${req.body.input}-${req.step5}` }),
      ],
    },
    async (req) => {
      expect(req.step1).toBe('a')
      expect(req.step2).toBe('ab')
      expect(req.step3).toBe('abc')
      expect(req.step4).toBe('abcd')
      expect(req.step5).toBe('abcde')
      expect(req.final).toBe('test-abcde')
      expect(req.body.input).toBe('test')

      return NextResponse.json({
        result: req.final,
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ input: 'test' }),
  })

  const res = await route(request, { params: Promise.resolve({}) })
  expect(await res.json()).toEqual({ result: 'test-abcde' })
})

it('should handle compound middleware with single function', async () => {
  // Single compound middleware function that does multiple transformations
  const WithCompoundMiddleware = (req: { body: { userId: string; action: string }; headers: any; cookies: any; nextUrl: any; query: null; routeParams: null }) => {
    // Simulate multiple middleware operations in one function
    const withUser = {
      ...req,
      user: {
        id: req.body.userId,
        name: `User-${req.body.userId}`,
        role: 'admin',
      },
    }

    const withTimestamp = {
      ...withUser,
      timestamp: Date.now(),
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
    }

    const withPermissions = {
      ...withTimestamp,
      permissions: [`read:${withUser.user.id}`, `write:${withUser.user.id}`, 'delete'],
      session: {
        active: true,
        expires: withTimestamp.timestamp + 3600000, // 1 hour
      },
    }

    const withAudit = {
      ...withPermissions,
      auditTrail: {
        action: req.body.action,
        user: withPermissions.user.name,
        timestamp: withPermissions.timestamp,
        permissions: withPermissions.permissions,
        metadata: `${withPermissions.user.name} with role ${withPermissions.user.role} performed ${req.body.action}`,
      },
    }

    return withAudit
  }

  const route = createRoute(
    {
      body: z.object({
        userId: z.string(),
        action: z.string(),
      }),
      response: z.object({
        success: z.boolean(),
        data: z.object({
          user: z.string(),
          action: z.string(),
          requestId: z.string(),
          permissions: z.array(z.string()),
          auditMessage: z.string(),
        }),
      }),
      middlewares: [WithCompoundMiddleware],
    },
    async (req) => {
      // Verify all compound middleware properties are accessible and properly typed
      expect(req.user.id).toBe('user456')
      expect(req.user.name).toBe('User-user456')
      expect(req.user.role).toBe('admin')
      expect(typeof req.timestamp).toBe('number')
      expect(req.requestId).toMatch(/^req-[a-z0-9]{9}$/)
      expect(req.permissions).toEqual(['read:user456', 'write:user456', 'delete'])
      expect(req.session.active).toBe(true)
      expect(typeof req.session.expires).toBe('number')
      expect(req.auditTrail.action).toBe('create')
      expect(req.auditTrail.user).toBe('User-user456')
      expect(req.auditTrail.metadata).toContain('User-user456 with role admin performed create')
      
      // Original request properties should still be accessible
      expect(req.body.userId).toBe('user456')
      expect(req.body.action).toBe('create')

      return NextResponse.json({
        success: true,
        data: {
          user: req.user.name,
          action: req.auditTrail.action,
          requestId: req.requestId,
          permissions: req.permissions,
          auditMessage: req.auditTrail.metadata,
        },
      })
    },
  )

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ userId: 'user456', action: 'create' }),
  })

  const res = await route(request, { params: Promise.resolve({}) })
  const result = await res.json()

  expect(result.success).toBe(true)
  expect(result.data.user).toBe('User-user456')
  expect(result.data.action).toBe('create')
  expect(result.data.permissions).toEqual(['read:user456', 'write:user456', 'delete'])
  expect(result.data.auditMessage).toContain('User-user456 with role admin performed create')
  expect(result.data.requestId).toMatch(/^req-[a-z0-9]{9}$/)
})
