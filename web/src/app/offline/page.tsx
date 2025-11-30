'use client'

import { Card } from '@/components/ui'
import { WifiIcon } from '@heroicons/react/24/outline'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="max-w-md w-full text-center">
        <WifiIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're offline</h1>
        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-macos-blue-500 text-white rounded-macos hover:bg-macos-blue-600 transition-macos"
        >
          Retry
        </button>
      </Card>
    </div>
  )
}

