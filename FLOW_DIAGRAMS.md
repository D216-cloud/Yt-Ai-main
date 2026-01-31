# Authentication Flow Diagrams

## How NextAuth Works (With Your Fixes)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. USER CLICKS "SIGN IN"
   ↓
2. NextAuth Shows Provider (Google/Email)
   ↓
3. User authenticates with provider
   ↓
4. NextAuth calls signIn callback (route.ts)
   ├─ Upserts user to Supabase users table
   └─ Sets JWT token in HTTP-only cookie
   ↓
5. Browser stores session cookie automatically
   ├─ NOT accessible from localStorage
   ├─ NOT sent in request body
   └─ Sent automatically with every request
   ↓
6. Redirect to /connect or dashboard
   ↓
✅ USER IS NOW AUTHENTICATED
```

---

## API Request Flow (With Session)

```
┌─────────────────────────────────────────────────────────────────┐
│              CLIENT COMPONENT MAKES API CALL                    │
└─────────────────────────────────────────────────────────────────┘

const { data, error } = await apiGet('/api/challenges')
                          ↓
                  (lib/api.ts utility)
                          ↓
        fetch('/api/challenges', {
          credentials: 'include'  ← KEY: Include cookies
        })
                          ↓
   Browser automatically adds cookie header:
   Cookie: next-auth.session-token=abc123def456...
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE (Server)                           │
└─────────────────────────────────────────────────────────────────┘

export async function GET(req: Request) {
  // 1. Read session from cookie
  const auth = await getAuthenticatedUser()
                      ↓
  // Inside getAuthenticatedUser():
  // - Get session from cookie via getServerSession()
  // - Look up user in Supabase by email
  // - Verify user_id exists
                      ↓
  if (!auth) return 401 Unauthorized
                      ↓
  // 2. Now safe to use auth.userId
  const { data } = await supabase
    .from('user_challenges')
    .eq('user_id', auth.userId)  ← VERIFIED USER ID
                      ↓
  // 3. Return data
  return NextResponse.json(data)
}
                          ↓
Response with data sent back to client
                          ↓
✅ CLIENT RECEIVES DATA
```

---

## Component Ref Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT WITH REF (forwardRef)                    │
└─────────────────────────────────────────────────────────────────┘

PARENT COMPONENT:
┌────────────────────────┐
│ const ref = useRef()   │ Creates ref
│ <MyComponent ref={ref} /> Passes ref
└────────────────────────┘
           ↓
CHILD COMPONENT (forwardRef):
┌──────────────────────────────┐
│ const MyComponent = forwardRef│
│   <HTMLDivElement, Props>    │
│   (({ title }, ref) => {      │
│     return <div ref={ref}>... │
│   }                           │
│   )                           │
│ MyComponent.displayName = ... │
└──────────────────────────────┘
           ↓
PARENT CAN NOW:
┌────────────────────────┐
│ ref.current.focus()    │
│ ref.current.value      │
│ ref.current.scrollTo() │
└────────────────────────┘

KEY REQUIREMENTS:
✅ Use forwardRef wrapper
✅ Accept ref as 2nd parameter
✅ Pass ref to actual DOM element
✅ Set displayName for debugging
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   API REQUEST ERROR CASES                       │
└─────────────────────────────────────────────────────────────────┘

CASE 1: User Not Logged In
    ↓
const auth = await getAuthenticatedUser()
    ↓
auth === null
    ↓
return NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }  ← 401 = User not authenticated
)
    ↓
CLIENT RECEIVES:
{
  "error": "Unauthorized",
  "status": 401
}
    ↓
Client should redirect to login

─────────────────────────────────────────────────────────────────

CASE 2: Database Query Error
    ↓
const { data, error } = await supabase
  .from('table')
  .select()
    ↓
error !== null
    ↓
return NextResponse.json(
  { error: error.message },
  { status: 500 }  ← 500 = Server error
)
    ↓
CLIENT RECEIVES:
{
  "error": "Database connection failed",
  "status": 500
}
    ↓
Client should show retry button

─────────────────────────────────────────────────────────────────

CASE 3: Invalid Request Data
    ↓
const body = await req.json()
body.title is undefined
    ↓
return NextResponse.json(
  { error: 'Missing required field: title' },
  { status: 400 }  ← 400 = Client error
)
    ↓
CLIENT RECEIVES:
{
  "error": "Missing required field: title",
  "status": 400
}
    ↓
Client should show validation error
```

---

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────┘

SESSION CREATED:
└─ User logs in
   └─ NextAuth generates JWT
   └─ Sets as HTTP-only cookie
   └─ Cookie expires in 30 days (configurable)

DURING SESSION:
└─ Every API request includes cookie
   └─ No manual token management needed
   └─ Token refreshed automatically
   └─ secure in HTTP-only (can't be stolen)

SESSION ENDS:
└─ User clicks logout
   └─ NextAuth clears cookie
   └─ Browser removes cookie
   └─ Next request to API returns 401
   └─ User redirected to login

BENEFITS OF HTTP-ONLY COOKIES:
✅ Cannot be accessed by JavaScript (no XSS steal)
✅ Automatically sent with requests
✅ Automatically cleared on logout
✅ Survive page refreshes
✅ Securely sent over HTTPS only
```

---

## Token vs Cookie: Why Cookies Win

```
┌──────────────────────────┬────────────────────────────┐
│    localStorage TOKEN    │   HTTP-ONLY COOKIE         │
├──────────────────────────┼────────────────────────────┤
│                          │                            │
│ ❌ Accessible via JS     │ ✅ Inaccessible via JS     │
│   (XSS vulnerability)    │   (secure)                 │
│                          │                            │
│ ❌ Must send manually    │ ✅ Sent automatically      │
│   in header              │   with requests            │
│                          │                            │
│ ❌ Easily forgotten      │ ✅ Never forgotten         │
│   in some requests       │   (always sent)            │
│                          │                            │
│ ❌ Need to parse & send  │ ✅ Browser handles it      │
│   in every fetch         │   automatically            │
│                          │                            │
│ ❌ Expires based on      │ ✅ Expires based on date   │
│   localStorage clear     │   (clean expiration)      │
│                          │                            │
└──────────────────────────┴────────────────────────────┘

NEXTAUTH DEFAULT:
Strategy: "jwt"  (HTTP-only cookie)
           ↓
This is the SECURE choice ✅
```

---

## Your Fix Applied

```
┌─────────────────────────────────────────────────────────────────┐
│              BEFORE: Problems in Your Code                      │
└─────────────────────────────────────────────────────────────────┘

❌ Problem 1: Inconsistent auth checking
async function resolveUser() {
  const session = await getServerSession() // Only checks session
  // Doesn't verify user exists in DB!
  return session
}

❌ Problem 2: Trying to use localStorage token
const token = localStorage.getItem('token') // Returns null!
fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
})

❌ Problem 3: No centralized API utility
// Every component does fetch differently
fetch('/api/endpoint')
// Session not included!

❌ Problem 4: Components with refs
export function VideoCard({ ref }) {
  return <div ref={ref}>...</div> // Warning!
}

┌─────────────────────────────────────────────────────────────────┐
│              AFTER: Fixes Applied                               │
└─────────────────────────────────────────────────────────────────┘

✅ Solution 1: Centralized auth utility
async function getAuthenticatedUser() {
  const session = await getServerSession()  // Get session
  // Verify user in DB by email
  // Return { userId, email, name, session } or null
}

✅ Solution 2: Use session cookies
// No localStorage token needed!
fetch('/api/endpoint', {
  credentials: 'include'  // Include cookies
})

✅ Solution 3: Centralized API utility
const { data, error } = await apiGet('/api/endpoint')
// credentials: 'include' handled automatically!

✅ Solution 4: Components with forwardRef
const VideoCard = forwardRef<HTMLDivElement, Props>(
  ({ }, ref) => (
    <div ref={ref}>...</div>
  )
)
VideoCard.displayName = 'VideoCard'
```

---

## File Dependency Graph

```
┌──────────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                            │
└──────────────────────────────────────────────────────────────────┘

CLIENT COMPONENTS
    ├─ app/challenge/page.tsx
    ├─ app/upload/page.tsx
    └─ app/dashboard/page.tsx
         ↓
    lib/api.ts ──────┐
         ↓           │
    useSession()     │
         ↓           │
    NextAuth         │
    cookies          │
         ↓           ↓
    ┌─────────────────────────┐
    │   API ROUTES (Server)   │
    ├─────────────────────────┤
    │ app/api/challenges/...  │
    │ app/api/upload/...      │
    └─────────────────────────┘
         ↓
    getAuthenticatedUser() (NEW)
         ↓
    lib/supabase.ts
         ↓
    Supabase
    Database


KEY ADDITION: lib/auth.ts
└─ Centralizes all auth logic
└─ Used by all API routes
└─ Prevents inconsistencies
```

---

## Quick Decision Tree

```
QUESTION: Should I store token in localStorage?
         │
         ├─ Are you using NextAuth? → YES
         │                             │
         │                             └─ NO! Use HTTP-only cookies
         │                                (getServerSession works)
         │
         └─ No NextAuth? → YES
                           │
                           └─ YES, use localStorage
                              (and include in headers)

QUESTION: Do I need forwardRef?
         │
         ├─ Is component receiving ref prop? → YES
         │                                     │
         │                                     └─ YES! Use forwardRef
         │
         ├─ Do I want parent to access DOM? → YES
         │                                     │
         │                                     └─ YES! Use forwardRef
         │
         └─ Internal component only? → NO
                                       │
                                       └─ NO! Don't need forwardRef

QUESTION: Getting 401 error?
         │
         ├─ Is user logged in? → NO
         │                        │
         │                        └─ Log in first!
         │
         ├─ Are you sending credentials? → NO
         │                                 │
         │                                 └─ Add: credentials: 'include'
         │
         ├─ Does API check auth? → NO
         │                         │
         │                         └─ Add: getAuthenticatedUser() check
         │
         └─ User in DB? → NO
                          │
                          └─ Check: SELECT * FROM users
```

---

## Deployment Checklist Visualization

```
┌──────────────────────────────────┐
│   ENVIRONMENT VARIABLES SETUP    │
├──────────────────────────────────┤
│                                  │
│ NEXTAUTH_SECRET (Generate!)      │ openssl rand -base64 32
│ ✓ openssl rand -base64 32        │
│                                  │
│ NEXTAUTH_URL (Update!)           │ https://yourdomain.com
│ ✓ http://localhost:3000 → prod   │
│                                  │
│ GOOGLE_CLIENT_ID                 │ From Google Cloud Console
│ ✓ Paste value                    │
│                                  │
│ GOOGLE_CLIENT_SECRET             │ Keep this SECRET!
│ ✓ Paste value                    │
│                                  │
│ NEXT_PUBLIC_SUPABASE_URL         │ From Supabase settings
│ ✓ Paste value                    │
│                                  │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY    │ From Supabase settings
│ ✓ Paste value                    │
│                                  │
│ SUPABASE_SERVICE_KEY             │ From Supabase settings
│ ✓ Paste value (SERVER ONLY!)     │
│                                  │
└──────────────────────────────────┘
         ↓
    DEPLOY FUNCTION
         ↓
    SET ENV VARS IN PLATFORM
    (Vercel/Netlify/Render)
         ↓
    RUN TESTS
    ├─ Login works?
    ├─ Logout works?
    ├─ API returns data?
    └─ No 401 errors?
         ↓
    ✅ DEPLOYMENT COMPLETE
```

---

## Summary

The diagrams show how all pieces fit together:
1. **Session Flow**: User logs in → Cookie created → Sent with requests
2. **API Flow**: Component calls API → Cookie included → Auth verified → Data returned
3. **Ref Flow**: Parent passes ref → forwardRef forwards it → Parent can access DOM
4. **Error Flow**: Various failures → Proper HTTP status codes → Client handles
5. **Architecture**: Centralized utilities prevent bugs and inconsistency

All fixes follow these patterns. Review the examples to understand and apply to your code.
