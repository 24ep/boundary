'use client'

import React from 'react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Configure your admin panel settings</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Settings Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Application settings, preferences, and configuration options will be available here.
                </p>
            </div>
        </div>
    )
}
