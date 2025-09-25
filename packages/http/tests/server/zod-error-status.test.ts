import { NextRequest, NextResponse } from 'next/server'
import { buildRoute } from '../../src/server/build-route'
import { z } from 'zod'

describe('Zod validation error status codes', () => {
  it('should return 400 for Zod validation errors in request body', async () => {
    const route = buildRoute({
      body: z.object({
        name: z.string().min(3),
        age: z.number().positive(),
      }),
    }).handle(async (req) => {
      return NextResponse.json({})
    })

    const request = new NextRequest('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ab', // Too short, should fail validation
        age: -5, // Negative, should fail validation
      }),
    })

    const response = await route(request, { params: Promise.resolve({}) })
    
    // Check status code
    expect(response.status).toBe(400)
    
    // Check response body
    const responseBody = await response.json()
    expect(responseBody.type).toBe('invalid_data')
    expect(responseBody.message).toContain('String must contain at least 3 character(s)')
    expect(responseBody.message).toContain('Number must be greater than 0')
    expect(responseBody.errors).toBeDefined()
  })

  it('should return 400 for invalid JSON body', async () => {
    const route = buildRoute({
      body: z.object({
        name: z.string(),
      }),
    }).handle(async (req) => {
      return NextResponse.json({})
    })

    const request = new NextRequest('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{invalid json',
    })

    const response = await route(request, { params: Promise.resolve({}) })
    
    expect(response.status).toBe(400)
    const responseBody = await response.json()
    expect(responseBody.type).toBe('invalid_data')
  })

  it('should return 400 for empty JSON body when body is required', async () => {
    const route = buildRoute({
      body: z.object({
        name: z.string(),
      }),
    }).handle(async (req) => {
      return NextResponse.json({})
    })

    const request = new NextRequest('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    })

    const response = await route(request, { params: Promise.resolve({}) })
    
    expect(response.status).toBe(400)
    const responseBody = await response.json()
    expect(responseBody.type).toBe('invalid_data')
    expect(responseBody.message).toBe('Body must not be empty')
  })

  it('should return 400 for password validation error', async () => {
    const route = buildRoute({
      body: z.object({
        password: z.string().min(8, 'Password must be at least 8 characters long'),
      }),
    }).handle(async (req) => {
      return NextResponse.json({})
    })

    const request = new NextRequest('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'short', // Too short, should fail validation
      }),
    })

    const response = await route(request, { params: Promise.resolve({}) })
    
    // Check status code
    expect(response.status).toBe(400)
    
    // Check response body
    const responseBody = await response.json()
    expect(responseBody.type).toBe('invalid_data')
    expect(responseBody.message).toContain('Password must be at least 8 characters long')
  })
})