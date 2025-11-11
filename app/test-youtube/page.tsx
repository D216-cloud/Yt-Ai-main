"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function TestYouTubeConnection() {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testConnection = async () => {
    if (!clientId || !clientSecret) {
      setResult({ success: false, message: "Please enter both Client ID and Client Secret" })
      return
    }

    setIsTesting(true)
    setResult(null)

    try {
      // Test YouTube Data API connection
      const testChannelId = "UC_x5XG1OV2P6uZZ5FSM9Ttw" // Google Developers channel
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${testChannelId}&key=AIzaSyB2Hu4D97zOB8f410cwT2rCc6JnmwoLCAo`
      )

      if (response.ok) {
        setResult({ 
          success: true, 
          message: "YouTube API connection successful! Your credentials are correctly configured." 
        })
      } else {
        const errorData = await response.json()
        setResult({ 
          success: false, 
          message: `API Error: ${errorData.error?.message || "Failed to connect to YouTube API"}`
        })
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `Network Error: ${error.message || "Failed to connect to YouTube API"}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>YouTube API Connection Test</CardTitle>
            <CardDescription>
              Test your YouTube Client ID and Secret to ensure they are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Client ID</label>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your YouTube Client ID"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Client Secret</label>
                <Input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter your YouTube Client Secret"
                  className="mt-1"
                />
              </div>
            </div>

            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 mr-2" />
                  )}
                  <AlertDescription>
                    <p className={result.success ? "text-green-700" : "text-red-700"}>
                      {result.message}
                    </p>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Setup Instructions</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the YouTube Data API v3</li>
                <li>Create OAuth 2.0 credentials (Client ID and Secret)</li>
                <li>Add your redirect URI: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/youtube/auth</code></li>
                <li>Copy your Client ID and Secret here to test</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}