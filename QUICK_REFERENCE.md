# Quick Reference: NextAuth + API Patterns

## ✅ DO THIS - Server API Route

```typescript
// app/api/challenges/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    // 1. Check auth
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get DB client
    const supabase = createServerSupabaseClient()

    // 3. Query with userId
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', auth.userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // 4. Return data
    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## ✅ DO THIS - Client Component

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { apiGet, apiPost } from '@/lib/api'
import { useEffect, useState } from 'react'

export default function MyPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    const loadData = async () => {
      // Use API utility - automatically includes session
      const { data, error } = await apiGet('/api/challenges')
      
      if (!error) {
        setData(data)
      }
    }

    loadData()
  }, [status])

  if (status !== 'authenticated') {
    return <div>Please log in</div>
  }

  return <div>{/* Render data */}</div>
}
```

---

## ✅ DO THIS - Component with Ref

```typescript
import { forwardRef } from 'react'

interface MyComponentProps {
  children: React.ReactNode
}

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ children }, ref) => {
    return <div ref={ref}>{children}</div>
  }
)

MyComponent.displayName = 'MyComponent'
export default MyComponent
```

---

## ❌ DON'T DO THIS - Common Mistakes

### Mistake 1: Storing token in localStorage
```typescript
// ❌ WRONG
const token = localStorage.getItem('token')
fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// ✅ RIGHT
const { data } = await apiGet('/api/endpoint')
// Session cookie sent automatically
```

### Mistake 2: Not checking auth in API route
```typescript
// ❌ WRONG
export async function GET() {
  // No auth check!
  const data = await db.query()
  return NextResponse.json(data)
}

// ✅ RIGHT
export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const data = await db.query()
  return NextResponse.json(data)
}
```

### Mistake 3: Missing forwardRef
```typescript
// ❌ WRONG
export function MyComponent({ ref }) {
  return <div ref={ref}>...</div> // Warning!
}

// ✅ RIGHT
const MyComponent = forwardRef(({ }, ref) => {
  return <div ref={ref}>...</div>
})
MyComponent.displayName = 'MyComponent'
```

### Mistake 4: Not setting dynamic route
```typescript
// ❌ WRONG
export async function GET() {
  const session = await getServerSession() // May be static!
}

// ✅ RIGHT
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession() // Always dynamic
}
```

---

## API Utilities

### GET Request
```typescript
import { apiGet } from '@/lib/api'

const { data, error, status } = await apiGet('/api/challenges')

if (error) {
  console.error(`Error ${status}: ${error}`)
  return
}

// data is now typed
const challenges = data.challenges
```

### POST Request
```typescript
import { apiPost } from '@/lib/api'

const { data, error } = await apiPost('/api/challenges', {
  title: 'My Challenge',
  description: 'Do this challenge'
})

if (error) {
  console.error(error)
  return
}

// data contains response
console.log(data)
```

### PUT/PATCH/DELETE
```typescript
import { apiPut, apiPatch, apiDelete } from '@/lib/api'

// PUT entire resource
await apiPut('/api/challenges/123', { title: 'Updated' })

// PATCH partial update
await apiPatch('/api/challenges/123', { status: 'completed' })

// DELETE resource
await apiDelete('/api/challenges/123')
```

---

## Environment Setup

Create `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-from-openssl

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx  # Server only
```

---

## Debugging

### Check if logged in
```typescript
// Browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### Check cookies
```
DevTools → Application → Cookies
Look for: next-auth.session-token
```

### Check user in DB
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Check API response
```typescript
// Browser console
fetch('/api/challenges')
  .then(r => r.json())
  .then(console.log)
```

---

## Deployment Checklist

- [ ] Set `NEXTAUTH_URL=https://yourdomain.com`
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Set all env vars in deployment platform
- [ ] Test login on production
- [ ] Test API calls work
- [ ] Check public files accessible

---

## Status Codes Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the data |
| 400 | Bad request | Check your input |
| 401 | Unauthorized | Log in again |
| 403 | Forbidden | Not allowed to access |
| 404 | Not found | Check the URL |
| 500 | Server error | Check server logs |

