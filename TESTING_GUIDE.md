# Testing & Verification Guide

## 1. Local Development Testing

### Start the dev server
```bash
npm run dev
# or
yarn dev
```

### Test NextAuth Session (Browser Console)
```javascript
// Check if session exists
fetch('/api/auth/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)

// Output should be:
// {
//   user: { email, name, image },
//   expires: "2024-02-29T..."
// }
```

### Test API Route (Browser Console)
```javascript
// Test with session
fetch('/api/challenges', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)

// Should return: { challenges: [...], count: N }
// If 401: User not logged in
// If 500: Server error (check logs)
```

### Test API Utility (Browser Console)
```javascript
// Use the apiGet() function in a component
import { apiGet } from '@/lib/api'

const { data, error } = await apiGet('/api/challenges')
console.log('Data:', data)
console.log('Error:', error)
```

---

## 2. Manual Testing Steps

### Test 1: Login Flow
```
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Note: No session cookies yet
4. Click "Sign In" button on page
5. Login with Google account
6. Check Application → Cookies
7. Should see: next-auth.session-token
8. Verify user in database:
   - Supabase dashboard
   - users table
   - Should have your email
```

### Test 2: API Authentication
```
1. After logging in, open DevTools Console
2. Run:
   fetch('/api/challenges', { credentials: 'include' })
   .then(r => r.json())
   .then(console.log)

3. Check response:
   - Should NOT be { error: 'Unauthorized' }
   - Should have { challenges: [...] }
   
4. If 401:
   - Check if logged in: fetch('/api/auth/session').then(r => r.json()).then(console.log)
   - Check cookies exist
   - Check user in Supabase DB
```

### Test 3: Component Refs
```
1. Find a component that accepts ref
2. Check for warnings in console
3. Should NOT see: "Function components cannot be given refs"
4. If warning appears:
   - Wrap component with forwardRef
   - Add displayName
   - Test again
```

### Test 4: Static Files
```
1. Open DevTools → Network tab
2. Navigate to page with images
3. Check image requests
4. All should return 200
5. If 404:
   - Check file in /public folder
   - Check path in code is correct (no "public/" prefix)
   - Verify file name matches exactly
```

### Test 5: Logout Flow
```
1. Click logout button
2. Check Application → Cookies
3. Should see: next-auth.session-token removed
4. Try to access /api/challenges
5. Should get 401 Unauthorized
6. Page should redirect to /signup
```

---

## 3. Automated Testing

### Test Authentication Utility
```typescript
// tests/auth.test.ts
import { getAuthenticatedUser } from '@/lib/auth'

describe('getAuthenticatedUser', () => {
  it('should return null when not authenticated', async () => {
    const auth = await getAuthenticatedUser()
    expect(auth).toBeNull()
  })

  it('should return user when authenticated', async () => {
    // Mock session
    const auth = await getAuthenticatedUser()
    expect(auth).toHaveProperty('userId')
    expect(auth).toHaveProperty('email')
  })
})
```

### Test API Route
```typescript
// tests/api/challenges.test.ts
import { GET } from '@/app/api/challenges/route'

describe('GET /api/challenges', () => {
  it('should return 401 when not authenticated', async () => {
    const response = await GET(new Request('http://localhost/api/challenges'))
    expect(response.status).toBe(401)
  })

  it('should return challenges when authenticated', async () => {
    // Mock session
    const response = await GET(new Request('http://localhost/api/challenges'))
    expect(response.status).toBe(200)
  })
})
```

---

## 4. Common Issues & Diagnostics

### Issue: Always Getting 401

#### Diagnostic Steps:
```javascript
// 1. Check session exists
fetch('/api/auth/session').then(r => r.json()).then(console.log)
// Should show user object, not null

// 2. Check user in database
// In Supabase console:
SELECT * FROM users WHERE email = 'your-email@example.com'
// Should have 1 row

// 3. Check cookies are sent
fetch('/api/auth/session', {
  // Try WITHOUT credentials first
}).then(r => r.json()).then(console.log)
// Should return empty {}

// Now WITH credentials
fetch('/api/auth/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
// Should return user object

// 4. Check token isn't in localStorage
console.log(localStorage.getItem('token'))
// Should return null
// NextAuth uses cookies, not localStorage!
```

#### Solutions:
```bash
# 1. Clear browser data and login again
DevTools → Application → Clear storage → Clear all

# 2. Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# 3. Check API route has proper auth check
# Should have: const auth = await getAuthenticatedUser()

# 4. Restart dev server
npm run dev
```

### Issue: Getting 500 Error

#### Diagnostic Steps:
```
1. Check server logs in terminal
   Look for error message

2. Check Supabase connectivity
   - Verify env variables are set
   - Test connection in Supabase dashboard

3. Check database schema
   - Verify tables exist
   - Verify columns match query

4. Add console.error logging
   export async function GET() {
     try { ... }
     catch (error) {
       console.error('DETAILED ERROR:', error)
       return ...
     }
   }

5. Restart with fresh environment
   rm -rf .next
   npm run dev
```

#### Solutions:
```bash
# 1. Check all env variables
cat .env.local

# 2. Verify Supabase service
# Visit supabase.com dashboard

# 3. Check API route syntax
# Verify using correct imports

# 4. Test with simpler query
# Start with SELECT * to debug
```

### Issue: React Ref Warning

#### Diagnostic Steps:
```javascript
// Open DevTools Console
// Look for: "Function components cannot be given refs"

// Find component in code
// Check if it has ref prop: ref={...}

// Look at component definition
// If no forwardRef → That's the problem!
```

#### Solutions:
```typescript
// 1. Wrap with forwardRef
const MyComponent = forwardRef<HTMLDivElement, Props>(
  (props, ref) => <div ref={ref}>{...}</div>
)

// 2. Add displayName
MyComponent.displayName = 'MyComponent'

// 3. Restart dev server
npm run dev

// 4. Verify warning is gone
// No more warnings in console
```

---

## 5. Production Validation Checklist

```bash
#!/bin/bash
# Production validation script

echo "🔍 Checking Environment Variables..."
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET not set"
else
  echo "✅ NEXTAUTH_SECRET set"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "❌ NEXTAUTH_URL not set"
else
  echo "✅ NEXTAUTH_URL = $NEXTAUTH_URL"
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo "❌ GOOGLE_CLIENT_ID not set"
else
  echo "✅ GOOGLE_CLIENT_ID set"
fi

echo ""
echo "🔍 Checking Application Build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "✅ Production validation complete!"
```

---

## 6. Performance Monitoring

### Add to your component:
```typescript
// Track API call performance
const start = performance.now()

const { data, error } = await apiGet('/api/challenges')

const duration = performance.now() - start
console.log(`API call took ${duration}ms`)

// Track component render
useEffect(() => {
  console.log('Component mounted')
  
  return () => {
    console.log('Component unmounted')
  }
}, [])
```

### Monitor Network Requests:
```
DevTools → Network tab

Look for:
- /api/challenges - Should be < 200ms
- /api/auth/session - Should be < 100ms
- Static files - Should be cached (304)

Red flags:
- Requests > 1000ms
- 500 errors
- Missing 'next-auth.session-token' cookie
```

---

## 7. Debugging with VS Code

### Add breakpoints
```typescript
// In app/api/challenges/route.ts
export async function GET(req: Request) {
  // Click line number to add breakpoint
  const auth = await getAuthenticatedUser() // ← Breakpoint here
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // More code...
}
```

### Debug in VS Code
```bash
# Start with debugger
node --inspect-brk node_modules/.bin/next dev
```

Then:
1. Open `chrome://inspect`
2. Find Node process
3. Click "Inspect"
4. Step through code

---

## 8. Quick Health Check

Run this JavaScript in browser console after deployment:

```javascript
async function healthCheck() {
  console.log('🏥 Health Check Started...\n')
  
  // 1. Check session
  console.log('1. Checking session...')
  const session = await fetch('/api/auth/session', { 
    credentials: 'include' 
  }).then(r => r.json())
  
  if (session?.user?.email) {
    console.log('   ✅ Session active:', session.user.email)
  } else {
    console.log('   ❌ No session - Please log in')
    return
  }
  
  // 2. Check API
  console.log('\n2. Checking API...')
  const api = await fetch('/api/challenges', {
    credentials: 'include'
  }).then(r => ({ status: r.status, data: r.json() }))
    .then(async (r) => ({ ...r, data: await r.data }))
  
  if (api.status === 200) {
    console.log('   ✅ API working:', api.data.challenges.length, 'challenges')
  } else {
    console.log('   ❌ API error:', api.status)
  }
  
  // 3. Check static files
  console.log('\n3. Checking static files...')
  const img = await fetch('/placeholder.jpg').then(r => r.status)
  if (img === 200) {
    console.log('   ✅ Static files accessible')
  } else {
    console.log('   ❌ Static files returning:', img)
  }
  
  console.log('\n🏥 Health Check Complete!')
}

healthCheck()
```

---

## 9. Database Verification Queries

Run in Supabase dashboard (SQL Editor):

```sql
-- Check users table
SELECT id, email, name, created_at FROM users LIMIT 10;

-- Check if your user exists
SELECT * FROM users WHERE email = 'your@email.com';

-- Check challenges for user
SELECT id, user_id, challenge_title, status 
FROM user_challenges 
WHERE user_id = 'YOUR_USER_ID'
LIMIT 5;

-- Check stats
SELECT * FROM user_challenge_stats 
WHERE user_id = 'YOUR_USER_ID';

-- Count total users
SELECT COUNT(*) FROM users;
```

---

## 10. Log Analysis Guide

### What to look for in server logs:

#### ✅ Good Logs:
```
✅ Supabase user upserted: user@example.com
✅ NextAuth signIn event: Google
✅ challenges GET success: 5 challenges returned
```

#### ❌ Bad Logs:
```
❌ Error upserting user: Connection refused
❌ Error getting authenticated user: Session null
❌ Database error: Invalid query
❌ Supabase client init failed: SUPABASE_URL not set
```

### Enable detailed logging:
```typescript
// lib/auth.ts - add verbose logging
export async function getAuthenticatedUser() {
  console.log('📍 getAuthenticatedUser() called')
  
  const session = await getServerSession(authOptions)
  console.log('📍 Session:', session?.user?.email || 'null')
  
  if (!session?.user?.email) {
    console.log('❌ No session email found')
    return null
  }
  
  // ... rest of function with logging
}
```

---

## Summary

After implementing fixes:

1. ✅ Run local tests
2. ✅ Test manual flow
3. ✅ Check browser console (no errors)
4. ✅ Verify database entries
5. ✅ Build for production
6. ✅ Deploy with env variables
7. ✅ Run health check on production
8. ✅ Monitor for 24 hours
9. ✅ Check performance metrics
10. ✅ Setup error tracking

All systems should be ✅ Green!
