'use client'

import React from 'react'

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500">Manage platform users</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">User Management Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    View, edit, and manage platform users here.
                </p>
            </div>
        </div>
    )
}
