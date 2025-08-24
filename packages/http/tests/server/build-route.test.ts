import { NextRequest, NextResponse } from 'next/server'
import { NextasticRequest, buildRoute } from '../../src/server/build-route'
import { z } from 'zod'

// Type-only tests for middleware typing
describe('TypeScript type checking', () => {
  it('should enforce base request type without middleware', () => {
    // Without middlewares, req should have base request type
    buildRoute({
      body: z.object({ name: z.string() }),
    }).handle(async (req) => {
      // @ts-expect-error - user property should not exist without middleware
      expect(req.user).toBeDefined()

      // These should work fine
      expect(req.body.name).toBe('string')
      expect(req.headers).toBeDefined()

      return NextResponse.json({})
    })
  })

  it('should transform request type with middleware', () => {
    // With middlewares, req should have transformed type
    buildRoute({})
      .use((req) => ({
        ...req,
        user: { id: 'test' },
      }))
      .handle(async (req) => {
        // This should work - middleware adds user
        expect(req.user.id).toBe('string')

        // @ts-expect-error - nonexistent property
        expect(req.nonexistent).toBeDefined()

        return NextResponse.json({})
      })
  })

  it('should error on middleware type mismatch', () => {
    // Middleware type mismatch should error
    buildRoute({
      body: z.object({ name: z.string() }),
    })
      // @ts-expect-error - middleware input type doesn't match base request
      .use((req: { different: string }) => ({ ...req, user: { id: 'test' } }))
      .handle(async () => {
        return NextResponse.json({})
      })
  })
})

it('should handle basic GET request', async () => {
  const route = buildRoute({
    response: z.object({
      ok: z.boolean(),
    }),
  }).handle(async (req) => {
    expect(req.nextUrl.pathname).toEqual('/api/test')

    return NextResponse.json({
      ok: true,
    })
  })

  const request = new NextRequest('http://localhost/api/test', {
    method: 'GET',
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({ ok: true })
})

it('should handle POST request with JSON body', async () => {
  const route = buildRoute({
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
    response: z.object({
      success: z.boolean(),
    }),
  }).handle(async (req) => {
    expect(req.body).toEqual({
      name: 'John',
      age: 25,
    })
    return NextResponse.json({ success: true })
  })

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
  const route = buildRoute({
    body: z.object({
      file: z.instanceof(File),
    }),
    isFormData: true,
    response: z.object({
      received: z.boolean(),
    }),
  }).handle(async (req) => {
    expect(req.body instanceof FormData).toBe(true)
    expect((req.body as FormData).get('file') instanceof File).toBe(true)
    return NextResponse.json({ received: true })
  })

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
  const route = buildRoute({
    body: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }).handle(async () => {
    return NextResponse.json({})
  })

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ name: 'John' }), // missing required age field
  })

  const res = await route(request, {
    params: Promise.resolve({}),
  })

  expect(await res.json()).toEqual({
    type: 'invalid_data',
    message: 'Invalid input: expected number, received undefined for "age"',
    errors: expect.any(Object),
  })
  expect(res.status).toBe(400)
})

it('should handle query parameters', async () => {
  const route = buildRoute({
    query: z.object({
      search: z.string(),
      page: z.string().transform(Number),
    }),
    response: z.object({
      query: z.object({
        search: z.string(),
        page: z.number().optional(),
      }),
    }),
  }).handle(async (req) => {
    return NextResponse.json({
      query: req.query,
    })
  })

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
  const route = buildRoute({
    body: z.object({
      name: z.string(),
    }),
    response: z.object({
      userId: z.string(),
    }),
  })
    .use((req) => {
      const foo = {
        ...req,
        user: {
          id: 'user123',
        },
      }

      return foo
    })
    .handle(async (req) => {
      expect(req.user.id).toBe('user123')

      return NextResponse.json({
        userId: req.user.id,
      })
    })

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
  const addUser = <T>(req: T) => ({
    ...req,
    user: { id: 'user456' },
  })

  const addRole = <T>(req: T) => ({
    ...req,
    role: 'admin',
  })

  const addGreeting = <
    T extends NextasticRequest<z.ZodObject<{ name: z.ZodString }>>,
  >(
    req: T,
  ) => ({
    ...req,
    greeting: `Hello ${req.body.name}`,
  })

  const route = buildRoute({
    body: z.object({
      name: z.string(),
    }),
    response: z.object({
      message: z.string(),
      userId: z.string(),
      role: z.string(),
    }),
  })
    .use(addUser)
    .use(addRole)
    .use(addGreeting)
    .handle(async (req) => {
      expect(req.user.id).toBe('user456')
      expect(req.role).toBe('admin')
      expect(req.greeting).toBe('Hello Jane')
      expect(req.body.name).toBe('Jane')

      return NextResponse.json({
        message: req.greeting,
        userId: req.user.id,
        role: req.role,
      })
    })

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
  const route = buildRoute({
    body: z.object({
      email: z.string().email(),
    }),
    response: z.object({
      welcome: z.string(),
      userEmail: z.string(),
      timestamp: z.number(),
    }),
  })
    .use((req) => ({
      ...req,
      currentUser: {
        email: req.body.email,
        id: 'user789',
      },
    }))
    .use((req) => ({
      ...req,
      timestamp: Date.now(),
    }))
    .handle(async (req) => {
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
    })

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

it('should handle many middlewares', async () => {
  const route = buildRoute({
    body: z.object({ input: z.string() }),
    response: z.object({ result: z.string() }),
  })
    .use((req) => ({ ...req, step1: 'a' }))
    .use((req) => ({ ...req, step2: req.step1 + 'b' }))
    .use((req) => ({ ...req, step3: req.step2 + 'c' }))
    .use((req) => ({ ...req, step4: req.step3 + 'd' }))
    .use((req) => ({ ...req, step5: req.step4 + 'e' }))
    .use((req) => ({ ...req, final: `${req.body.input}-${req.step5}` }))
    .handle(async (req) => {
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
    })

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ input: 'test' }),
  })

  const res = await route(request, { params: Promise.resolve({}) })
  expect(await res.json()).toEqual({ result: 'test-abcde' })
})

it('should handle compound middleware with single function', async () => {
  // Single compound middleware function that does multiple transformations
  const WithCompoundMiddleware = (req: {
    body: { userId: string; action: string }
    headers: any
    cookies: any
    nextUrl: any
    query: null
    routeParams: null
  }) => {
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
      permissions: [
        `read:${withUser.user.id}`,
        `write:${withUser.user.id}`,
        'delete',
      ],
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

  const route = buildRoute({
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
  })
    .use(WithCompoundMiddleware)
    .handle(async (req) => {
      // Verify all compound middleware properties are accessible and properly typed
      expect(req.user.id).toBe('user456')
      expect(req.user.name).toBe('User-user456')
      expect(req.user.role).toBe('admin')
      expect(typeof req.timestamp).toBe('number')
      expect(req.requestId).toMatch(/^req-[a-z0-9]{9}$/)
      expect(req.permissions).toEqual([
        'read:user456',
        'write:user456',
        'delete',
      ])
      expect(req.session.active).toBe(true)
      expect(typeof req.session.expires).toBe('number')
      expect(req.auditTrail.action).toBe('create')
      expect(req.auditTrail.user).toBe('User-user456')
      expect(req.auditTrail.metadata).toContain(
        'User-user456 with role admin performed create',
      )

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
    })

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ userId: 'user456', action: 'create' }),
  })

  const res = await route(request, { params: Promise.resolve({}) })
  const result = await res.json()

  expect(result.success).toBe(true)
  expect(result.data.user).toBe('User-user456')
  expect(result.data.action).toBe('create')
  expect(result.data.permissions).toEqual([
    'read:user456',
    'write:user456',
    'delete',
  ])
  expect(result.data.auditMessage).toContain(
    'User-user456 with role admin performed create',
  )
  expect(result.data.requestId).toMatch(/^req-[a-z0-9]{9}$/)
})

it('should short-circuit when middleware returns NextResponse', async () => {
  const route = buildRoute({
    body: z.object({
      token: z.string(),
    }),
    response: z.object({
      message: z.string(),
    }),
  })
    .use((req) => {
      if (req.body.token === 'invalid') {
        // Return early response - should short-circuit
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_FAILED' },
          { status: 401 },
        )
      }

      // Continue with normal flow
      return {
        ...req,
        user: { id: 'user123', token: req.body.token },
      }
    })
    .use((req) => {
      return {
        ...req,
        shouldNotReachHere: true,
      }
    })
    .handle(async (req) => {
      // Handler should NOT run when short-circuited
      return NextResponse.json({
        message: `Hello user ${req.user.id}`,
      })
    })

  // Test 1: Valid token - should go through all middleware and handler
  const validRequest = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ token: 'valid123' }),
  })

  const validRes = await route(validRequest, { params: Promise.resolve({}) })
  const validResult = await validRes.json()

  expect(validRes.status).toBe(200)
  expect(validResult.message).toBe('Hello user user123')

  // Test 2: Invalid token - should short-circuit at first middleware
  const invalidRequest = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ token: 'invalid' }),
  })

  const invalidRes = await route(invalidRequest, {
    params: Promise.resolve({}),
  })
  const invalidResult = await invalidRes.json()

  expect(invalidRes.status).toBe(401)
  expect(invalidResult.error).toBe('Unauthorized')
  expect(invalidResult.code).toBe('AUTH_FAILED')
  // Verify handler was not called (no 'message' property)
  expect(invalidResult.message).toBeUndefined()
})

it('should handle async middleware', async () => {
  // Mock async operations
  const fetchUserFromDB = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10)) // Simulate DB delay
    return {
      id: userId,
      name: `User-${userId}`,
      role: userId === 'admin' ? 'admin' : 'user',
      permissions: userId === 'admin' ? ['read', 'write', 'delete'] : ['read'],
    }
  }

  const logActivity = async (action: string, userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 5)) // Simulate logging delay
    return `${new Date().toISOString()}: ${userId} performed ${action}`
  }

  const route = buildRoute({
    body: z.object({
      userId: z.string(),
      action: z.string(),
    }),
    response: z.object({
      success: z.boolean(),
      user: z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
      }),
      activityLog: z.string(),
      timestamp: z.number(),
    }),
  })
    .use(async (req) => {
      const user = await fetchUserFromDB(req.body.userId)

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return {
        ...req,
        user,
      }
    })
    .use(async (req) => {
      const activityLog = await logActivity(req.body.action, req.user.id)

      return {
        ...req,
        activityLog,
        timestamp: Date.now(),
      }
    })
    .use(async (req) => {
      if (req.body.action === 'delete' && req.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions', required: 'admin' },
          { status: 403 },
        )
      }

      return {
        ...req,
        authorized: true,
      }
    })
    .handle(async (req: any) => {
      return NextResponse.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role,
        },
        activityLog: req.activityLog,
        timestamp: req.timestamp,
      })
    })

  // Test 1: Admin user with delete action - should succeed
  const adminRequest = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ userId: 'admin', action: 'delete' }),
  })

  const adminRes = await route(adminRequest, { params: Promise.resolve({}) })
  const adminResult = await adminRes.json()

  expect(adminRes.status).toBe(200)
  expect(adminResult.success).toBe(true)
  expect(adminResult.user.id).toBe('admin')
  expect(adminResult.user.name).toBe('User-admin')
  expect(adminResult.user.role).toBe('admin')
  expect(adminResult.activityLog).toContain('admin performed delete')
  expect(typeof adminResult.timestamp).toBe('number')

  // Test 2: Regular user with delete action - should be forbidden
  const userRequest = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ userId: 'user123', action: 'delete' }),
  })

  const userRes = await route(userRequest, { params: Promise.resolve({}) })
  const userResult = await userRes.json()

  expect(userRes.status).toBe(403)
  expect(userResult.error).toBe('Insufficient permissions')
  expect(userResult.required).toBe('admin')

  // Test 3: Regular user with read action - should succeed
  const readRequest = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ userId: 'user456', action: 'read' }),
  })

  const readRes = await route(readRequest, { params: Promise.resolve({}) })
  const readResult = await readRes.json()

  expect(readRes.status).toBe(200)
  expect(readResult.success).toBe(true)
  expect(readResult.user.id).toBe('user456')
  expect(readResult.user.role).toBe('user')
  expect(readResult.activityLog).toContain('user456 performed read')
})

it('should handle mixed sync and async middleware', async () => {
  const route = buildRoute({
    body: z.object({
      step: z.string(),
    }),
    response: z.object({
      result: z.string(),
      steps: z.array(z.string()),
    }),
  })
    .use((req) => ({
      ...req,
      step1: 'sync-step-1',
      steps: ['sync-step-1'],
    }))
    .use(async (req) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return {
        ...req,
        step2: 'async-step-2',
        steps: [...req.steps, 'async-step-2'],
      }
    })
    .use((req) => ({
      ...req,
      step3: 'sync-step-3',
      steps: [...req.steps, 'sync-step-3'],
    }))
    .use(async (req) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return {
        ...req,
        step4: 'async-step-4',
        steps: [...req.steps, 'async-step-4'],
      }
    })
    .handle(async (req: any) => {
      return NextResponse.json({
        result: `Completed: ${req.steps.join(' -> ')}`,
        steps: req.steps,
      })
    })

  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ step: 'start' }),
  })

  const res = await route(request, { params: Promise.resolve({}) })
  const result = await res.json()

  expect(res.status).toBe(200)
  expect(result.steps).toEqual([
    'sync-step-1',
    'async-step-2',
    'sync-step-3',
    'async-step-4',
  ])
  expect(result.result).toBe(
    'Completed: sync-step-1 -> async-step-2 -> sync-step-3 -> async-step-4',
  )
})
