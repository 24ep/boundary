'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  RectangleStackIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useContentContext } from '../providers/ContentProvider'

/**
 * Header component for content management
 * Contains the main title, description, and primary actions
 */
export const ContentHeader: React.FC = () => {
  const { state, actions, contentData } = useContentContext()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Title and Description */}
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Content Management <span className="text-green-600 text-sm">✨ REFACTORED</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage dynamic content with our powerful drag-and-drop editor
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => actions.setShowTemplates(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RectangleStackIcon className="h-4 w-4 mr-2" />
            Templates
          </button>
          <button
            onClick={actions.handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {contentData?.contentPages?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Total Content</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {contentData?.contentPages?.filter(p => p.status === 'published').length || 0}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {contentData?.contentPages?.filter(p => p.status === 'draft').length || 0}
          </div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
      </div>
    </div>
  )
}
