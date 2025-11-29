'use client'

import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface LoadingStateProps {
  message?: string
}

/**
 * Loading state component
 * Displays a loading spinner with optional message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}
