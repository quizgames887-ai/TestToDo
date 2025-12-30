import { AlertCircle, RefreshCw } from 'lucide-react'

interface ConnectionErrorProps {
  message?: string
  onRetry?: () => void
}

export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  const convexUrl = import.meta.env.VITE_CONVEX_URL

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-serif text-surface-900">Connection Error</h1>
        </div>
        
        <div className="space-y-4 text-sm font-sans text-surface-700">
          <p>{message || 'Unable to connect to the backend. Please check your configuration.'}</p>
          
          {!convexUrl && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="font-medium text-red-900 mb-2">Missing Configuration:</p>
              <p className="text-red-700">
                The <code className="bg-red-100 px-1 rounded">VITE_CONVEX_URL</code> environment variable is not set.
              </p>
              <p className="text-red-700 mt-2">
                Please set this in your Vercel/Netlify environment variables.
              </p>
            </div>
          )}

          {convexUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="font-medium text-yellow-900 mb-2">Configuration Found:</p>
              <p className="text-yellow-700 break-all mb-2">
                <code className="bg-yellow-100 px-1 rounded text-xs">{convexUrl}</code>
              </p>
              <div className="text-yellow-700 text-xs space-y-2">
                <p className="font-medium">If connection still fails, check:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>URL format is correct (starts with https://, ends with .convex.cloud)</li>
                  <li>Convex backend is deployed (run <code className="bg-yellow-100 px-1 rounded">npm run convex:deploy</code>)</li>
                  <li>You've redeployed Vercel after setting the variable</li>
                  <li>Check browser console (F12) for specific error messages</li>
                </ul>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="font-medium text-blue-900 mb-2">How to Fix:</p>
            {!convexUrl ? (
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-xs">
                <li>Go to your Vercel/Netlify project settings</li>
                <li>Navigate to Environment Variables</li>
                <li>Add <code className="bg-blue-100 px-1 rounded">VITE_CONVEX_URL</code></li>
                <li>Set the value to your Convex deployment URL</li>
                <li>Redeploy your application</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-xs">
                <li>Verify the URL value in Vercel matches your Convex Production URL</li>
                <li>Update the variable if the URL is incorrect</li>
                <li>Redeploy your Vercel application (Deployments → ⋯ → Redeploy)</li>
                <li>Check Convex Dashboard to ensure backend is deployed</li>
                <li>Clear browser cache and hard refresh (Ctrl+Shift+R)</li>
              </ol>
            )}
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

