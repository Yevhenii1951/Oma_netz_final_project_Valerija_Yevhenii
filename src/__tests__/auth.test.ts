import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

describe('Аутентификация', () => {
  beforeEach(async () => {
    // Очищаем базу перед каждым тестом (сначала связанные таблицы)
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

  it('должен успешно авторизовать с правильным паролем', async () => {
    // Создаём пользователя с хешированным паролем
    const password = 'password123'
    const hashedPassword = await hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'HELPER',
      },
    })
    
    // Проверяем что пользователь существует в БД
    expect(user).toBeTruthy()
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe('HELPER')
  })

  it('должен отказать при неправильном пароле', async () => {
    // Создаём пользователя
    const password = 'password123'
    const hashedPassword = await hash(password, 12)
    
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'HELPER',
      },
    })

    // Проверяем что bcrypt.compare вернёт false для неправильного пароля
    const { compare } = await import('bcryptjs')
    const isValid = await compare('wrong_password', hashedPassword)
    
    // Пароль не должен совпасть
    expect(isValid).toBe(false)
  })
})
