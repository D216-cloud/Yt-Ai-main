# Next.js 14 + NextAuth + Supabase Authentication Guide

## Problem Summary

You had multiple authentication-related issues:
1. **401 Unauthorized on API routes** - Session not being passed or checked properly
2. **Missing access tokens in localStorage** - Incorrect token management approach
3. **500 errors on API routes** - Improper error handling and async/await issues
4. **React forwardRef warnings** - Components accepting refs without proper forwarding
5. **Static file 404s** - Public assets not in correct location

## Solution Overview

### 1. Fixed NextAuth Configuration ✅

Your `[...nextauth]/route.ts` is now correctly configured with:
- **JWT strategy** for session management (stateless, scalable)
- **Dynamic route** with `export const dynamic = 'force-dynamic'`
- **Node.js runtime** to avoid build issues
- **Proper callbacks** for sign-in and redirect

### 2. Centralized Auth Utility (`lib/auth.ts`) ✅

```typescript
import { getAuthenticatedUser } from '@/lib/auth'

// Use in API routes
export async function GET(req: Request) {
  const auth = await getAuthenticatedUser()
  
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const { userId, email, name, session } = auth
  // Now you have a verified user
}
```

**What this does:**
- Gets NextAuth session
- Verifies session has valid email
- Looks up user in Supabase by email
- Returns `userId`, `email`, `name`, and `session` object
- Returns `null` if any step fails

### 3. Fixed API Routes (`/api/challenges/*`)

#### Before (WRONG):
```typescript
async function resolveUser() {
  const session = await getServerSession()
  // Only checks NextAuth, doesn't validate user exists
  return { session, supabase }
}

export async function GET() {
  const resolved = await resolveUser()
  if (!resolved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Problem: resolveUser might return a session without verifying user in DB
}
```

#### After (CORRECT):
```typescript
export async function GET(req: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Please log in' },
      { status: 401 }
    )
  }
  
  const supabase = createServerSupabaseClient()
  // auth.userId is guaranteed to exist and be valid
}
```

**Key differences:**
- `getAuthenticatedUser()` verifies user exists in database
- Always returns structured error with message
- Supabase client created after auth check

### 4. Frontend Fetch Utility (`lib/api.ts`)

#### Why NextAuth doesn't work with manual localStorage tokens:

NextAuth uses **HTTP-only cookies** by default for JWT tokens:
```typescript
session: {
  strategy: "jwt"
}
```

This means:
- ✅ Token is automatically sent with requests (via cookies)
- ❌ You can't access it from `localStorage`
- ✅ Secure (can't be stolen via XSS)
- ✅ No manual token management needed

#### Wrong Approach:
```typescript
// ❌ DON'T DO THIS
const token = localStorage.getItem('token') // Doesn't exist
const response = await fetch('/api/challenges', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

#### Correct Approach:
```typescript
// ✅ DO THIS - Use the provided utility
import { apiGet } from '@/lib/api'

const { data, error } = await apiGet('/api/challenges')

if (!error) {
  // Use data
}
```

Or use bare fetch with credentials:
```typescript
const response = await fetch('/api/challenges', {
  credentials: 'include' // Include cookies (NextAuth session)
})
```

### 5. Example: Fixed Challenge Page

**File:** `app/challenge/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { apiGet, apiPost } from '@/lib/api'

export default function ChallengePage() {
  const { data: session, status } = useSession()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }

    const loadChallenges = async () => {
      try {
        const { data, error } = await apiGet('/api/challenges?includeUploads=true')
        
        if (error) {
          console.error('Failed to load challenges:', error)
          return
        }
        
        setChallenges(data.challenges || [])
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [status])

  const handleCreateChallenge = async (config: any) => {
    const { data, error, status: statusCode } = await apiPost('/api/challenges', config)
    
    if (error) {
      console.error(`Error (${statusCode}): ${error}`)
      return
    }
    
    // Success
    setChallenges([...challenges, data.challenge])
  }

  if (status === 'loading' || loading) return <div>Loading...</div>
  if (status !== 'authenticated') return <div>Please log in</div>

  return (
    <div>
      {/* Challenge UI */}
    </div>
  )
}
```

## 6. Fix React.forwardRef Issues

### The Problem

```typescript
// ❌ WRONG - Component receives ref but doesn't forward it
const VideoCard = ({ video, ref }) => {
  return <div ref={ref}>...</div> // Warning: "Function components cannot be given refs"
}
```

### The Solution

```typescript
// ✅ CORRECT - Use React.forwardRef
import { forwardRef } from 'react'

interface VideoCardProps {
  video: Video
}

const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(
  ({ video }, ref) => {
    return <div ref={ref} className="...">...</div>
  }
)

VideoCard.displayName = 'VideoCard'

export default VideoCard
```

**When you need forwardRef:**
- When parent component passes a `ref` prop
- For DOM elements (div, button, input, etc.)
- For accessing ref.current in parent

**When you don't need forwardRef:**
- Most shadcn/ui components (they already handle this)
- Custom hooks (use `useRef` directly)
- Internal component state refs

### Example: Fixed Component

**File:** `components/video-card.tsx`

```typescript
'use client'

import { useState, useRef, forwardRef } from 'react'
import Image from 'next/image'
import { Loader2, Zap } from 'lucide-react'

interface VideoCardProps {
  video: {
    id: string
    title: string
    thumbnail: string
    views: string
    duration: string
  }
}

const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(
  ({ video }, ref) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const formatViews = (views: string) => {
      const num = parseInt(views)
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
      return num.toString()
    }

    return (
      <div ref={ref} className="relative bg-white rounded-lg shadow hover:shadow-lg">
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-600">{formatViews(video.views)} views</p>
        </div>
      </div>
    )
  }
)

VideoCard.displayName = 'VideoCard'
export default VideoCard
```

## 7. Static Files / Public Assets

### Correct file placement:

```
project-root/
├── public/          ← Static files served at root
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholder.jpg
│   ├── icons/
│   └── animation/
```

### Usage in components:

```tsx
import Image from 'next/image'

// ✅ CORRECT - From public folder
<Image src="/images/logo.svg" alt="Logo" width={100} height={100} />

// ❌ WRONG - Don't use process.env.PUBLIC_URL
<Image src={`${process.env.PUBLIC_URL}/images/logo.svg`} />

// ❌ WRONG - Don't include "public/"
<Image src="/public/images/logo.svg" />
```

### CSS background images:

```css
/* ✅ CORRECT */
.header {
  background-image: url('/images/hero.jpg');
}

/* ❌ WRONG */
.header {
  background-image: url('public/images/hero.jpg');
}
```

## 8. Environment Variables Setup

Create `.env.local` in root:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000           # Production: https://yourdomain.com
NEXTAUTH_SECRET=your-generated-secret-key   # Run: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key       # Server only
```

**Important:**
- Variables starting with `NEXT_PUBLIC_` are exposed to frontend
- Service keys should never start with `NEXT_PUBLIC_`
- `NEXTAUTH_SECRET` required in production

## Debugging Checklist

When you get 401 Unauthorized:

1. ✅ User is logged in? Check with `useSession()` hook
2. ✅ NextAuth session exists? Check Network tab → Cookies
3. ✅ API route has `export const dynamic = 'force-dynamic'`?
4. ✅ User exists in Supabase? Check `SELECT * FROM users WHERE email = ?`
5. ✅ Using `credentials: 'include'` or `apiGet()` utility?

When you get 500 Server Error:

1. ✅ Check server logs for actual error
2. ✅ Wrap in try-catch with console.error()
3. ✅ Verify Supabase client initialization
4. ✅ Check query is valid (test in Supabase console)

## Production Deployment Checklist

- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- [ ] Verify all environment variables in deployment platform
- [ ] Test login/logout flow
- [ ] Test API route authentication
- [ ] Check `next.config.js` has no static optimization conflicts
- [ ] Verify public files are deployed correctly

## Summary of Changes

| File | Change |
|------|--------|
| `lib/auth.ts` | **NEW** - Centralized auth utility |
| `lib/api.ts` | **NEW** - Client fetch utility |
| `app/api/auth/[...nextauth]/route.ts` | No changes needed ✅ |
| `app/api/challenges/route.ts` | Use `getAuthenticatedUser()` instead of `resolveUser()` |
| `app/api/challenges/stats/route.ts` | Use `getAuthenticatedUser()` instead of `resolveUser()` |
| `app/challenge/page.tsx` | Use `apiGet()` / `apiPost()` instead of bare `fetch()` |
| Any component with `ref` prop | Wrap with `React.forwardRef()` |

