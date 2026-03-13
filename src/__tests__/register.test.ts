import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

describe('Регистрация', () => {
  beforeEach(async () => {
    // Очищаем базу перед каждым тестом
    await prisma.user.deleteMany()
  })

  it('должен успешно зарегистрировать SENIOR', async () => {
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

  it('должен вернуть 409 для существующего email', async () => {
    // Создаём пользователя
    await prisma.user.create({
      data: {
        email: 'existing@test.com',
        name: 'Existing User',
        password: 'hashed_password',
        role: 'SENIOR',
      },
    })

    // Пробуем зарегистрироваться с тем же email
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

    // Проверяем что получили ошибку 409
    expect(response.status).toBe(409)
  })
})
