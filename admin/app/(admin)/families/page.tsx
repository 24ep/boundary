'use client'

import React from 'react'

export default function FamiliesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Families</h1>
                <p className="text-gray-500">Manage family groups</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Family Management Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    View and manage family groups here.
                </p>
            </div>
        </div>
    )
}
