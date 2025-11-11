"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface ConfigStatus {
  clientId: string
  clientSecret: string
  apiKey: string
  redirectUri: string
}

export default function ConfigStatusPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState<ConfigStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigStatus = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/test-config")
      const data = await response.json()
      
      if (data.config) {
        setConfig(data.config)
      } else {
        setError(data.message || "Failed to fetch configuration status")
      }
    } catch (err) {
      setError("Failed to fetch configuration status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>YouTube API Configuration Status</CardTitle>
                <CardDescription>
                  Check if your YouTube API credentials are properly configured
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchConfigStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : config ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Client ID</span>
                  <span className={`px-2 py-1 rounded text-sm ${config.clientId === "Set" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {config.clientId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Client Secret</span>
                  <span className={`px-2 py-1 rounded text-sm ${config.clientSecret === "Set" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {config.clientSecret}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">API Key</span>
                  <span className={`px-2 py-1 rounded text-sm ${config.apiKey === "Set" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {config.apiKey}
                  </span>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Redirect URI</p>
                  <p className="text-sm text-blue-800 font-mono break-all">{config.redirectUri}</p>
                </div>
                
                {config.clientId === "Set" && config.clientSecret === "Set" ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your YouTube API credentials are properly configured! You can now connect your YouTube channel.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Missing required credentials. Please set your YouTube Client ID and Client Secret in your environment variables.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-900 mb-2">Environment Variables Setup</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    Add these variables to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:
                  </p>
                  <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_API_KEY=your_api_key_here`}
                  </pre>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}