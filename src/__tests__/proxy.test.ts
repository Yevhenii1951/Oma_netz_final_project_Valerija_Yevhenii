import { describe, it, expect, vi } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

// Мокаем auth() из @/auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

describe('Middleware (proxy.ts)', () => {
  it('должен редиректить на /login без сессии', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue(null)

    const request = new NextRequest(
      new URL('http://localhost:3000/dashboard')
    )

    const response = await proxy(request)

    // Проверяем редирект
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('должен блокировать HELPER с PENDING статусом от /requests', async () => {
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

    // Проверяем редирект на dashboard
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
