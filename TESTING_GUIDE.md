# 🧭 Полное руководство по тестированию OMA-NETZ Kassel

**Выпускной проект | DCI FullStack Bootcamp**

---

## 📑 Содержание

1. [Зачем нужны тесты?](#зачем-нужны-тесты)
2. [Симуляции: Что может сломаться](#симуляции-что-может-сломаться)
3. [Уязвимости в текущей реализации](#уязвимости-в-текущей-реализации)
4. [Что именно тестировать](#что-именно-тестировать)
5. [Настройка окружения](#настройка-окружения)
6. [Интеграция с GitHub Actions](#интеграция-s-github-actions)
7. [Приоритеты тестирования](#приоритеты-тестирования)

---

## 🎯 Зачем нужны тесты?

### Тесты — это не "надо для оценки"

```
┌─────────────────────────────────────────────────────────────┐
│  ТЕСТЫ — ЭТО ТВОЯ СТРАХОВКА ОТ:                            │
│                                                             │
│  1. Потери времени на дебаг (часы → минуты)                │
│  2. Позорных багов в продакшене                            │
│  3. Сломанной функциональности после изменений             │
│  4. Уязвимостей безопасности                               │
│  5. Проблем в командной работе                             │
└─────────────────────────────────────────────────────────────┘
```

### Сравнение: С тестами vs Без тестов

| Ситуация | Без тестов | С тестами |
|----------|------------|-----------|
| **Баг в продакшене** | Обнаруживают пользователи 😡 | Обнаруживаешь ты при разработке ✅ |
| **Время на фикс** | 4-8 часов (дебаг + срочный деплой) | 5-30 минут (до деплоя) |
| **Репутация** | "Проект глючит" | "Проект надёжный" |
| **Стресс** | Высокий (тушим пожар) | Низкий (тесты ловят ошибки) |
| **Уверенность** | "Надеюсь, работает" | "Знаю, что работает" |

---

## 🎭 Симуляции: Что может сломаться

### СИТУАЦИЯ 1: "Тихий баг в продакшене"

#### Контекст
Ты изменил `auth.ts` чтобы оптимизировать JWT callback.

**Без теста:**

```ts
// src/auth.ts — ты "улучшаешь" код
async jwt({ token, user }) {
    if (user) {
        token.id = user.id
        token.role = user.role
        // 😱 СЛУЧАЙНО удалил эту строку:
        // token.helperStatus = user.helperStatus
    }
    
    const fresh = await prisma.user.findUnique({...})
    token.helperStatus = fresh.helperStatus
    
    return token
}
```

**Что происходит:**

| День | Событие |
|------|---------|
| **День 1** | Деплоишь изменение. Всё работает на первый взгляд |
| **День 2** | Новый HELPER регистрируется, получает `PENDING_REVIEW` |
| **День 3** | Админ одобряет HELPER (меняет статус в БД на `APPROVED`) |
| **День 3, 14:00** | HELPER заходит на сайт → **редирект на dashboard** |
| **День 3, 14:05** | HELPER пишет: "Я одобрен, но не могу работать!" |
| **День 3, 18:00** | Находишь баг: `token.helperStatus` не устанавливается |
| **Итог** | 😡 5 часов потеряно, HELPER не мог работать 4 часа |

**С тестом:**

```ts
// __tests__/auth.test.ts
it('должен установить helperStatus из user при первом логине', async () => {
  const user = await prisma.user.create({
    data: {
      email: 'helper@test.com',
      role: 'HELPER',
      helperStatus: 'PENDING_REVIEW',
    },
  })

  const authorizedUser = await authorize({
    email: 'helper@test.com',
    password: 'password123',
  })

  expect(authorizedUser?.helperStatus).toBe('PENDING_REVIEW')
  // ❌ Тест падает сразу после твоего "улучшения"
  // Ты видишь проблему ДО деплоя
})
```

**Результат:**
```
❌ Test failed: expected 'PENDING_REVIEW' but got undefined

Ты видишь ошибку → чинишь → деплоишь рабочий код.
Никто не пострадал.
```

---

### СИТУАЦИЯ 2: "Регрессия после рефакторинга"

#### Контекст
Через 2 месяца ты меняешь валидацию пароля.

**Без теста:**

```ts
// src/app/api/auth/register/route.ts
const registerSchema = z.object({
  password: z.string().min(6, 'Passwort mindestens 6 Zeichen'), // было 8
})
```

**Проблемы:**
- В `seed.ts` пароли всё ещё 8+ символов
- В документации написано "минимум 8 символов"
- Frontend валидация говорит "минимум 8 символов"

**С тестом:**

```ts
// __tests__/register.test.ts
it('должен принимать пароль от 6 символов', async () => {
  const request = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test',
      email: 'test@test.com',
      password: '123456', // 6 символов
      role: 'SENIOR',
    }),
  })

  const response = await POST(request)
  expect(response.status).toBe(201)
})

it('должен отклонять пароль из 5 символов', async () => {
  const request = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test',
      email: 'test@test.com',
      password: '12345', // 5 символов
      role: 'SENIOR',
    }),
  })

  const response = await POST(request)
  expect(response.status).toBe(400)
})
```

---

### СИТУАЦИЯ 3: "Критическая уязвимость безопасности"

#### Контекст
Ты добавляешь возможность бана пользователей.

**Без теста:**

```ts
// src/proxy.ts
if (pathname.startsWith('/admin') && session?.user.role !== 'ADMIN') {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}

// 😱 Но забыл проверить isBanned для обычных пользователей!
```

**Что происходит:**

| Время | Событие |
|-------|---------|
| **10:00** | Админ банит проблемного HELPER |
| **10:10** | HELPER **всё ещё в системе** (сессия активна) |
| **10:15** | HELPER заходит на `/requests` → **видит все заявки** |
| **10:20** | HELPER создаёт фейковые offers → спамит |
| **12:00** | Пользователи жалуются на спам |
| **12:30** | Ты обнаруживаешь, что бан не работает |

**С тестом:**

```ts
// __tests__/proxy.test.ts
it('должен блокировать забаненного пользователя', async () => {
  const { auth } = await import('@/auth')
  vi.mocked(auth).mockResolvedValue({
    user: {
      id: '1',
      email: 'banned@test.com',
      role: 'HELPER',
      isBanned: true, // 😈 Забанен!
      helperStatus: 'APPROVED',
    },
  })

  const request = new NextRequest(
    new URL('http://localhost:3000/requests')
  )

  const response = await proxy(request)
  
  expect(response.status).toBe(307)
  expect(response.headers.get('location')).toContain('/login')
})
```

---

### СИТУАЦИЯ 4: "GitHub Actions + Тесты"

#### Контекст
Ты добавляешь новую фичу — изменение роли пользователя через админ-панель.

**Без тестов в CI:**

```yaml
# .github/workflows/ci.yml
jobs:
  quality-check:
    steps:
      - name: Run ESLint
        run: npm run lint
      - name: Build
        run: npm run build
      # ❌ Нет тестов!
```

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI Checks                                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ ESLint                                                   │
│  ✅ Build                                                    │
│  🟢 ALL CHECKS PASSED                                       │
└─────────────────────────────────────────────────────────────┘

Ты думаешь: "Отлично! Всё работает, можно мержить!"
```

**Проблема в коде:**

```ts
// src/app/api/admin/users/route.ts
export async function PATCH(req: Request) {
  const { userId, newRole } = await req.json()
  
  // 😱 НЕТ ПРОВЕРКИ что newRole валидный!
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }, // Может быть "SUPERADMIN" 😱
  })
}
```

**Через 2 дня после мержа:**
```
🚨 Админ ввёл "SUPERADMIN" → ошибка БД → все запросы падают
```

**С тестами в CI:**

```yaml
# .github/workflows/ci.yml
jobs:
  quality-check:
    steps:
      - name: Run ESLint
        run: npm run lint
      - name: Run Tests  # 🆕 НОВЫЙ ШАГ
        run: npm run test
      - name: Build
        run: npm run build
```

```ts
// __tests__/admin.test.ts
it('должен отклонить невалидную роль', async () => {
  const request = new Request('http://localhost:3000/api/admin/users', {
    method: 'PATCH',
    body: JSON.stringify({
      userId: '123',
      newRole: 'SUPERADMIN', // 😈 Не существует!
    }),
  })

  const response = await PATCH(request)
  expect(response.status).toBe(400) // ✅ Тест ожидает ошибку
})
```

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI Checks                                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ ESLint                                                   │
│  ❌ Tests: "должен отклонить невалидную роль"               │
│     Expected: 400                                           │
│     Received: 200                                           │
│  🔴 CI FAILED — Мерж заблокирован! 🔒                       │
└─────────────────────────────────────────────────────────────┘

Ты видишь ошибку ДО мержа → исправляешь → деплоишь рабочий код
```

---

## 🚨 Уязвимости в текущей реализации

### Критические места в твоём коде

#### 1. **auth.ts — JWT Callback (DB запрос на каждый запрос)**

```ts
// src/auth.ts — ТЕКУЩАЯ РЕАЛИЗАЦИЯ
async jwt({ token, user }) {
    if (user) {
        token.id = user.id
        token.role = (user as { role?: Role }).role
        token.helperStatus = (user as { helperStatus?: string | null }).helperStatus
    }
    
    // ⚠️ ПРОБЛЕМА: Этот запрос выполняется при КАЖДОМ запросе
    const fresh = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { isBanned: true, helperStatus: true },
    })
    if (!fresh || fresh.isBanned) return null
    if (token.role === 'HELPER' && token.helperStatus !== 'APPROVED') {
        token.helperStatus = fresh.helperStatus
    }
    return token
}
```

**Проблемы:**

| Проблема | Последствия | Решение |
|----------|-------------|---------|
| DB запрос на каждый запрос | 100 пользователей ≈ 3000-5000 запросов/день | Кэшировать, проверять раз в 5 мин |
| `helperStatus` не копируется из `user` при первом логине | HELPER не видит изменения до следующего запроса | Копировать в `if (user)` блоке |
| Нет таймаута на DB запрос | При проблемах с БД — зависание | Добавить `Promise.race` с таймаутом |

**Тест для проверки:**

```ts
// __tests__/auth.test.ts
it('должен копировать helperStatus из user при первом логине', async () => {
  const user = await prisma.user.create({
    data: {
      email: 'helper@test.com',
      role: 'HELPER',
      helperStatus: 'PENDING_REVIEW',
    },
  })

  const token = await jwtCallback({
    token: {},
    user: user,
  })

  expect(token.helperStatus).toBe('PENDING_REVIEW')
})

it('должен обновлять helperStatus из БД не чаще чем раз в 5 минут', async () => {
  // Создаём HELPER
  const helper = await prisma.user.create({
    data: {
      email: 'helper@test.com',
      role: 'HELPER',
      helperStatus: 'PENDING_REVIEW',
    },
  })

  // Первый запрос — получаем токен
  let token = await jwtCallback({
    token: { id: helper.id },
    user: helper,
  })

  // Админ меняет статус на APPROVED
  await prisma.user.update({
    where: { id: helper.id },
    data: { helperStatus: 'APPROVED' },
  })

  // Второй запрос сразу — статус НЕ должен обновиться (кэш)
  token = await jwtCallback({
    token: { ...token, lastDbCheck: Date.now() },
    user: null,
  })
  expect(token.helperStatus).toBe('PENDING_REVIEW') // Из кэша

  // Третий запрос через 6 минут — статус должен обновиться
  token = await jwtCallback({
    token: { ...token, lastDbCheck: Date.now() - 6 * 60 * 1000 },
    user: null,
  })
  expect(token.helperStatus).toBe('APPROVED') // Из БД
})
```

---

#### 2. **register/route.ts — Нет Rate Limiting**

```ts
// src/app/api/auth/register/route.ts — ТЕКУЩАЯ РЕАЛИЗАЦИЯ
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)
    
    // ⚠️ ПРОБЛЕМА: Нет ограничения на количество запросов!
    // Злоумышленник может создать 1000 аккаунтов за минуту
    
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })
    // ...
  }
}
```

**Проблемы:**

| Проблема | Последствия | Решение |
|----------|-------------|---------|
| Нет Rate Limiting | Спам-регистрации, DDOS | Upstash Redis + Ratelimit |
| Нет проверки IP | Один IP создаёт 100 аккаунтов | Лимит по IP адресу |
| Нет email верификации | Фейковые email, боты | Magic Links или OTP |

**Тест для проверки:**

```ts
// __tests__/rate-limit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаем Redis для тестов
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
    }),
  },
}))

describe('Rate Limiting', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  it('должен пропустить первые 5 запросов', async () => {
    for (let i = 0; i < 5; i++) {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: `User ${i}`,
          email: `user${i}@test.com`,
          password: 'password123',
          role: 'SENIOR',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    }
  })

  it('должен блокировать 6-й запрос', async () => {
    for (let i = 0; i < 5; i++) {
      await POST(/* ... */)
    }

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Spam User',
        email: 'spam@test.com',
        password: 'password123',
        role: 'SENIOR',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(429) // Too Many Requests
  })
})
```

---

#### 3. **proxy.ts — Нет проверки isBanned в начале**

```ts
// src/proxy.ts — ТЕКУЩАЯ РЕАЛИЗАЦИЯ
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r))

  if (isProtected && !session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // ⚠️ ПРОБЛЕМА: Проверка isBanned только в JWT callback
  // Но не здесь — забаненный пользователь может получить доступ
  
  // Admin-only guard
  if (pathname.startsWith('/admin') && session?.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ...
}
```

**Проблемы:**

| Проблема | Последствия | Решение |
|----------|-------------|---------|
| Нет проверки `isBanned` в middleware | Забаненный пользователь с активной сессией получает доступ | Проверять `session.user.isBanned` |
| Проверка только в JWT callback | До следующего запроса забаненный пользователь активен | Добавить в middleware |

**Тест для проверки:**

```ts
// __tests__/proxy.test.ts
import { describe, it, expect, vi } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

describe('Middleware — Ban Check', () => {
  it('должен блокировать забаненного пользователя на всех защищённых роутах', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: '1',
        email: 'banned@test.com',
        role: 'HELPER',
        isBanned: true, // 😈 Забанен!
        helperStatus: 'APPROVED',
      },
    })

    const request = new NextRequest(
      new URL('http://localhost:3000/requests')
    )

    const response = await proxy(request)
    
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('должен пускать незабаненного пользователя', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: '1',
        email: 'normal@test.com',
        role: 'HELPER',
        isBanned: false,
        helperStatus: 'APPROVED',
      },
    })

    const request = new NextRequest(
      new URL('http://localhost:3000/requests')
    )

    const response = await proxy(request)
    expect(response.status).toBe(200) // NextResponse.next()
  })
})
```

---

#### 4. **register/route.ts — Нет валидации helperStatus**

```ts
// src/app/api/auth/register/route.ts — ТЕКУЩАЯ РЕАЛИЗАЦИЯ
const user = await prisma.user.create({
  data: {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role as Role,
    // ⚠️ ПРОБЛЕМА: helperStatus устанавливается Prisma default (PENDING_REVIEW)
    // Но нет явной установки и проверки
  },
})
```

**Проблемы:**

| Проблема | Последствия | Решение |
|----------|-------------|---------|
| Нет явной установки `helperStatus` | Зависит от Prisma default | Явно устанавливать в create |
| SENIOR/RELATIVE получают `helperStatus` | Бессмысленное поле для не-HELPER | Устанавливать только для HELPER |

**Тест для проверки:**

```ts
// __tests__/register.test.ts
it('должен установить HELPER статус PENDING_REVIEW', async () => {
  const request = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Helper',
      email: 'helper@test.com',
      password: 'password123',
      role: 'HELPER',
    }),
  })

  const response = await POST(request)
  const data = await response.json()

  expect(response.status).toBe(201)
  expect(data.data.helperStatus).toBe('PENDING_REVIEW')
})

it('не должен устанавливать helperStatus для SENIOR', async () => {
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

  expect(response.status).toBe(201)
  // SENIOR не должен иметь helperStatus или null
})
```

---

#### 5. **api-helpers.ts — requireAuth не кэширует**

```ts
// src/lib/api-helpers.ts — ТЕКУЩАЯ РЕАЛИЗАЦИЯ
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }
  return session
}

// ⚠️ ПРОБЛЕМА: Вызывается в каждом API endpoint
// Каждый вызов — новый запрос к auth()
```

**Проблемы:**

| Проблема | Последствия | Решение |
|----------|-------------|---------|
| Нет кэширования сессии | Multiple calls = multiple auth checks | Кэшировать в рамках запроса |

---

## 📋 Что именно тестировать

### Уровень 1: Критические тесты (Обязательно)

#### 1. Тесты аутентификации (`auth.test.ts`)

```
📁 src/__tests__/auth.test.ts
```

| № | Тест | Почему важно |
|---|------|--------------|
| 1.1 | ✅ Успешный логин с правильными credentials | Базовая функциональность |
| 1.2 | ❌ Логин с неправильным паролем → null | Безопасность |
| 1.3 | ❌ Логин с несуществующим email → null | Безопасность |
| 1.4 | ❌ Забаненный пользователь → null | Критично для модерации |
| 1.5 | ✅ JWT токен содержит id, role, helperStatus | Нужно для авторизации |
| 1.6 | ✅ Session содержит все поля пользователя | Проверка callbacks.session |
| 1.7 | ⚠️ JWT refresh из DB (isBanned проверяется) | Важно для блокировок |

**Пример реализации:**

```ts
// src/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

describe('Authentication', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  it('должен успешно авторизовать с правильными credentials', async () => {
    const password = await hash('password123', 12)
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password,
        role: 'HELPER',
      },
    })

    // Импортируем authorize из auth.ts
    const authModule = await import('@/auth')
    // Тестирование через signIn или прямой вызов authorize
  })

  it('должен отказать при неправильном пароле', async () => {
    const password = await hash('password123', 12)
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password,
        role: 'HELPER',
      },
    })

    // Попытка входа с неправильным паролем
    // Должна вернуться null
  })

  it('должен отказать забаненному пользователю', async () => {
    const password = await hash('password123', 12)
    await prisma.user.create({
      data: {
        email: 'banned@example.com',
        name: 'Banned User',
        password,
        role: 'HELPER',
        isBanned: true,
      },
    })

    // Попытка входа → должна вернуться null
  })
})
```

---

#### 2. Тесты регистрации (`register.test.ts`)

```
📁 src/__tests__/register.test.ts
```

| № | Тест | Почему важно |
|---|------|--------------|
| 2.1 | ✅ Успешная регистрация SENIOR | Базовая функциональность |
| 2.2 | ✅ Успешная регистрация HELPER | Базовая функциональность |
| 2.3 | ❌ Регистрация с существующим email → 409 | Защита от дубликатов |
| 2.4 | ❌ Короткий пароль (<8) → 400 | Валидация |
| 2.5 | ❌ Невалидный email → 400 | Валидация |
| 2.6 | ❌ Короткое имя (<2) → 400 | Валидация |
| 2.7 | ✅ HELPER получает статус PENDING_REVIEW | Бизнес-логика |
| 2.8 | ✅ Админы получают notification | Важная фича |

**Пример реализации:**

```ts
// src/__tests__/register.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

describe('Registration API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.notification.deleteMany()
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

    expect(response.status).toBe(201)
    expect(data.data.email).toBe('senior@test.com')
    expect(data.data.role).toBe('SENIOR')
  })

  it('должен вернуть 409 для существующего email', async () => {
    await prisma.user.create({
      data: {
        email: 'existing@test.com',
        name: 'Existing',
        password: 'hashed',
        role: 'SENIOR',
      },
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'existing@test.com',
        password: 'password123',
        role: 'SENIOR',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(409)
  })

  it('должен вернуть 400 для короткого пароля', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'test@test.com',
        password: '12345', // 5 символов
        role: 'SENIOR',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('должен создать notification для админов', async () => {
    await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin',
        password: 'hashed',
        role: 'ADMIN',
      },
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Helper',
        email: 'helper@test.com',
        password: 'password123',
        role: 'HELPER',
      }),
    })

    await POST(request)

    const notifications = await prisma.notification.findMany()
    expect(notifications.length).toBeGreaterThan(0)
    expect(notifications[0].title).toContain('Neue Registrierung')
  })
})
```

---

#### 3. Тесты middleware (`proxy.test.ts`)

```
📁 src/__tests__/proxy.test.ts
```

| № | Тест | Почему важно |
|---|------|--------------|
| 3.1 | ❌ Доступ к /dashboard без сессии → /login | Защита роутов |
| 3.2 | ✅ Доступ к /dashboard с сессией → OK | Базовая функциональность |
| 3.3 | ✅ Доступ к /login с сессией → /dashboard | UX |
| 3.4 | ❌ Доступ к /admin не-ADMIN → /dashboard | Безопасность |
| 3.5 | ✅ Доступ к /admin ADMIN → OK | Безопасность |
| 3.6 | ❌ HELPER с PENDING к /requests → /dashboard | Бизнес-логика |
| 3.7 | ✅ HELPER с APPROVED к /requests → OK | Бизнес-логика |

**Пример реализации:**

```ts
// src/__tests__/proxy.test.ts
import { describe, it, expect, vi } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

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
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('должен пускать на /dashboard с сессией', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: '1',
        email: 'test@test.com',
        role: 'SENIOR',
        helperStatus: null,
      },
    })

    const request = new NextRequest(
      new URL('http://localhost:3000/dashboard')
    )

    const response = await proxy(request)
    expect(response.status).toBe(200)
  })

  it('должен блокировать HELPER с PENDING статусом', async () => {
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
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('должен блокировать не-ADMIN от /admin', async () => {
    const { auth } = await import('@/auth')
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: '1',
        email: 'senior@test.com',
        role: 'SENIOR',
      },
    })

    const request = new NextRequest(
      new URL('http://localhost:3000/admin')
    )

    const response = await proxy(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
```

---

#### 4. Тесты API helpers (`api-helpers.test.ts`)

```
📁 src/__tests__/api-helpers.test.ts
```

| № | Тест | Почему важно |
|---|------|--------------|
| 4.1 | ✅ requireAuth() с сессией → session | Базовая функциональность |
| 4.2 | ❌ requireAuth() без сессии → 401 | Защита API |
| 4.3 | ✅ requireAdmin() с ADMIN → session | Безопасность |
| 4.4 | ❌ requireAdmin() не ADMIN → 403 | Безопасность |
| 4.5 | ✅ jsonError() → правильный формат | Консистентность API |
| 4.6 | ✅ jsonSuccess() → правильный формат | Консистентность API |

---

### Уровень 2: Бизнес-логика (Важно)

#### 5. Тесты бизнес-логики

```
📁 src/__tests__/business-logic.test.ts
```

| № | Тест | Почему важно |
|---|------|--------------|
| 5.1 | ✅ Создание Request → статус OPEN | Бизнес-логика |
| 5.2 | ✅ Создание Offer → статус PENDING | Бизнес-логика |
| 5.3 | ✅ Accept Offer → статус ACCEPTED | Бизнес-логика |
| 5.4 | ✅ Завершение Request → начисление points | Важная фича |
| 5.5 | ✅ Создание Rating → обновление ratingAvg | Важная фича |
| 5.6 | ✅ Redemption → списание points | Важная фича |

---

### Уровень 3: Дополнительные тесты (По желанию)

#### 6. E2E тесты (Playwright/Cypress)

```
📁 e2e/auth.spec.ts
📁 e2e/registration.spec.ts
📁 e2e/requests.spec.ts
```

**Что тестировать:**
- Реальные клики в браузере
- Полные пользовательские сценарии
- Визуальная проверка UI

#### 7. Тесты компонентов

```
📁 src/components/__tests__/
```

**Что тестировать:**
- Формы (Login, Register)
- Карточки (RequestCard, UserCard)
- Интерактивные элементы (Chat, Notifications)

---

## 🛠 Настройка окружения

### Шаг 1: Установить Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Шаг 2: Добавить конфиг

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Шаг 3: Добавить скрипт в package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:ci": "vitest --run"
  }
}
```

### Шаг 4: Создать setup файл

```ts
// src/__tests__/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Мокаем next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

// Мокаем next-auth
vi.mock('next-auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))
```

### Шаг 5: Создать .env.test

```bash
# .env.test
DATABASE_URL=postgresql://user:password@localhost:5432/oma_netz_test
NEXTAUTH_SECRET=test_secret_for_testing_only
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔗 Интеграция с GitHub Actions

### Обновлённый workflow

```yaml
# .github/workflows/ci.yml
name: CI Checks

on:
  pull_request:
    branches:
      - main

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      # 🆕 НОВЫЙ ШАГ — ТЕСТЫ
      - name: Run Tests
        run: npm run test:ci
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000

      - name: Build
        run: npm run build
```

### Настройка секретов в GitHub

```
1. Перейди в репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret:

   TEST_DATABASE_URL=postgresql://user:pass@host:5432/oma_netz_test
   NEXTAUTH_SECRET=твой_секрет_для_тестов
   NEXTAUTH_URL=https://твой-домен.com
```

### Что изменится в CI

**БЕЗ тестов:**
```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI Checks                                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ Checkout                                                 │
│  ✅ Setup Node.js                                            │
│  ✅ Install dependencies                                     │
│  ✅ Run ESLint                                               │
│  ✅ Build                                                    │
│  🟢 ALL CHECKS PASSED                                       │
└─────────────────────────────────────────────────────────────┘
```

**С тестами:**
```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI Checks                                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ Checkout                                                 │
│  ✅ Setup Node.js                                            │
│  ✅ Install dependencies                                     │
│  ✅ Run ESLint                                               │
│  ✅ Run Tests (26 passed)                                    │
│  ✅ Build                                                    │
│  🟢 ALL CHECKS PASSED                                       │
│  ✅ Ready to merge                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Приоритеты тестирования

### Матрица приоритетов

```
┌────────────────────────────────────────────────────────────┐
│  ПРИОРИТЕТ 1 (Обязательно для защиты проекта)              │
├────────────────────────────────────────────────────────────┤
│  ✅ Тесты регистрации (8 тестов)                           │
│  ✅ Тесты аутентификации (7 тестов)                        │
│  ✅ Тесты middleware (7 тестов)                            │
│  ✅ Тесты api-helpers (6 тестов)                           │
│  ───────────────────────────────────────────────────────── │
│  ИТОГО: ~28 тестов                                         │
│  ВРЕМЯ: 1-2 дня                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ПРИОРИТЕТ 2 (Желательно для отличной оценки)              │
├────────────────────────────────────────────────────────────┤
│  ✅ Тесты бизнес-логики (6 тестов)                         │
│  ✅ 1-2 Integration теста (полный сценарий)                │
│  ───────────────────────────────────────────────────────── │
│  ИТОГО: ~8-10 тестов                                       │
│  ВРЕМЯ: 1-2 дня                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ПРИОРИТЕТ 3 (Если есть время)                             │
├────────────────────────────────────────────────────────────┤
│  ⭐ E2E тесты (Playwright)                                 │
│  ⭐ Тесты компонентов                                      │
│  ───────────────────────────────────────────────────────── │
│  ВРЕМЯ: 2-3 дня                                            │
└────────────────────────────────────────────────────────────┘
```

### Итоговая таблица

| Файл | Кол-во тестов | Приоритет | Сложность | Время |
|------|---------------|-----------|-----------|-------|
| `auth.test.ts` | 7 | 🔴 Обязательно | Средняя | 2-3 часа |
| `register.test.ts` | 8 | 🔴 Обязательно | Средняя | 2-3 часа |
| `proxy.test.ts` | 7 | 🔴 Обязательно | Средняя | 2-3 часа |
| `api-helpers.test.ts` | 6 | 🔴 Обязательно | Лёгкая | 1-2 часа |
| `business-logic.test.ts` | 6 | 🟡 Желательно | Сложная | 3-4 часа |
| `integration.test.ts` | 3 | 🟡 Желательно | Сложная | 3-4 часа |
| `e2e/*.spec.ts` | 5+ | 🟢 По желанию | Сложная | 1-2 дня |
| `components/**/*.test.tsx` | 10+ | 🟢 По желанию | Средняя | 1-2 дня |

---

## 📊 Сравнение стратегий аутентификации

### NextAuth vs Clerk vs Supabase

| Критерий | NextAuth | Clerk | Supabase |
|-----------|----------|-------|----------|
| **Стоимость (100 пользователей/день)** | €0 | €0 | €0 |
| **Кастомные поля (`helperStatus`)** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **DSGVO-совместимость** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Контроль** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Уже настроено** | ✅ Готово | ❌ Заново | ❌ Заново |
| **Линейность для обучения** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### Рекомендация

```
┌─────────────────────────────────────────────────────────────┐
│  ОСТАВАЙСЯ НА NEXTAUTH — аргументы:                        │
│                                                             │
│  1. Уже реализовано — смена будет пустой тратой времени    │
│  2. Идеально для 100 пользователей/день                    │
│  3. Кастомная логика с helperStatus элегантно решена       │
│  4. Для выпускного проекта — больше ценности для обучения  │
│  5. OAuth-провайдеры легко добавить позже                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Следующие шаги

### План действий на 3 дня

```
┌─────────────────────────────────────────────────────────────┐
│  ДЕНЬ 1: Настройка и первые тесты                           │
├─────────────────────────────────────────────────────────────┤
│  1. Установить Vitest и зависимости                        │
│  2. Создать vitest.config.ts                               │
│  3. Создать setup.ts                                       │
│  4. Создать .env.test                                      │
│  5. Написать register.test.ts (8 тестов)                   │
│  6. Запустить локально: npm test                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ДЕНЬ 2: Тесты аутентификации и middleware                 │
├─────────────────────────────────────────────────────────────┤
│  1. Написать auth.test.ts (7 тестов)                       │
│  2. Написать proxy.test.ts (7 тестов)                      │
│  3. Написать api-helpers.test.ts (6 тестов)                │
│  4. Обновить .github/workflows/ci.yml                      │
│  5. Добавить секреты в GitHub                              │
│  6. Запустить CI и убедиться что проходит                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ДЕНЬ 3: Бизнес-логика и интеграция                        │
├─────────────────────────────────────────────────────────────┤
│  1. Написать business-logic.test.ts (6 тестов)             │
│  2. Написать 1 integration test (полный сценарий)          │
│  3. Запустить npm run test:coverage                        │
│  4. Проверить покрытие (цель: 70%+ для критических файлов) │
│  5. Закоммитить и запушить                                 │
│  6. Создать PR и проверить CI                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [GitHub Actions](https://docs.github.com/en/actions)

### Примеры тестов
- [NextAuth Testing](https://next-auth.js.org/tutorials/testing)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing/testing)

---

## ✅ Чек-лист готовности

```
□ Vitest установлен и настроен
□ vitest.config.ts создан
□ setup.ts создан с моками
□ .env.test создан с тестовой БД
□ register.test.ts написан (8 тестов)
□ auth.test.ts написан (7 тестов)
□ proxy.test.ts написан (7 тестов)
□ api-helpers.test.ts написан (6 тестов)
□ business-logic.test.ts написан (6 тестов)
□ .github/workflows/ci.yml обновлён
□ Секреты добавлены в GitHub
□ CI проходит успешно
□ Покрытие тестов 70%+ для критических файлов
```

---

**Последнее обновление:** Март 2026  
**Автор:** Выпускной проект OMA-NETZ Kassel  
**Статус:** Готово к использованию
