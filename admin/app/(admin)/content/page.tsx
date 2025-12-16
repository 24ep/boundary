'use client'

import React from 'react'

export default function ContentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-gray-500">Manage your content and pages</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Content Editor Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    This section will include the content editor, page builder, and content management tools.
                </p>
            </div>
        </div>
    )
}
