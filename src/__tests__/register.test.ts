import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

describe('Registration', () => {
  beforeEach(async () => {
    // Clean up database before each test (related tables first)
    await prisma.notification.deleteMany()
    await prisma.redemption.deleteMany()
    await prisma.rating.deleteMany()
    await prisma.message.deleteMany()
    await prisma.chat.deleteMany()
    await prisma.offer.deleteMany()
    await prisma.request.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should successfully register a SENIOR user', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Senior',
        email: 'senior@test.com',
        password: 'password123',
        role: 'SENIOR',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Проверяем что регистрация успешна
    expect(response.status).toBe(201)
    expect(data.data.email).toBe('senior@test.com')
    expect(data.data.role).toBe('SENIOR')
    expect(data.message).toBe('Registrierung erfolgreich!')
  })

  it('should return 409 for existing email', async () => {
    // Create existing user
    await prisma.user.create({
      data: {
        email: 'existing@test.com',
        name: 'Existing User',
        password: 'hashed_password',
        role: 'SENIOR',
      },
    })

    // Try to register with the same email
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Another User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'SENIOR',
      }),
    })

    const response = await POST(request)

    // Check that we get 409 error
    expect(response.status).toBe(409)
  })
})
