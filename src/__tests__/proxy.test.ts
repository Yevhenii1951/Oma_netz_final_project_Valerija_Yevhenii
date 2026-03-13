import { describe, it, expect, vi } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

// Mock auth() from @/auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

describe('Middleware (proxy.ts)', () => {
  it('should redirect to /login without session', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue(null)

    const request = new NextRequest(
      new URL('http://localhost:3000/dashboard')
    )

    const response = await proxy(request)

    // Check redirect
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('should block HELPER with PENDING status from /requests', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: '1',
        email: 'helper@test.com',
        role: 'HELPER',
        helperStatus: 'PENDING_REVIEW',
      },
    })

    const request = new NextRequest(
      new URL('http://localhost:3000/requests')
    )

    const response = await proxy(request)

    // Check redirect to dashboard
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
