'use client'

import React from 'react'

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                <p className="text-gray-500">Manage your images, videos, and files</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">🖼️</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Media Library Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Upload, organize, and manage your media files here.
                </p>
            </div>
        </div>
    )
}
