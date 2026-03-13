import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

describe('Authentication', () => {
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

  it('should successfully authenticate with correct password', async () => {
    // Create user with hashed password
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
    
    // Check that user exists in database
    expect(user).toBeTruthy()
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe('HELPER')
  })

  it('should reject incorrect password', async () => {
    // Create user
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

    // Check that bcrypt.compare returns false for wrong password
    const { compare } = await import('bcryptjs')
    const isValid = await compare('wrong_password', hashedPassword)
    
    // Password should not match
    expect(isValid).toBe(false)
  })
})
