"use client"

import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthErrorPage() {
  const params = useSearchParams()
  const error = params.get('error') || 'Unknown'
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-xl text-center">
        <h1 className="text-2xl font-semibold mb-4">Authentication Error</h1>
        <p className="mb-4">Error: <strong>{error}</strong></p>
        <p className="text-sm text-gray-300 mb-6">This may be caused by incorrect OAuth configuration. Check your Google OAuth redirect URIs and ensure <code>NEXTAUTH_URL</code> matches your deployment domain.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push('/api/test-config')} className="px-4 py-2 bg-blue-600 rounded">View config</button>
          <button onClick={() => router.push('/signup')} className="px-4 py-2 border rounded">Back to Sign In</button>
        </div>
      </div>
    </div>
  )
}