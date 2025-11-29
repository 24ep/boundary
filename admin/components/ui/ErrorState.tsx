'use client'

import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorStateProps {
  title: string
  description: string
  error?: string | null
  onRetry?: () => void
}

/**
 * Error state component
 * Displays when there's an error loading content
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  description, 
  error, 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-4 max-w-sm">{description}</p>
      {error && (
        <p className="text-sm text-red-600 text-center mb-6 max-w-sm">
          {error}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
