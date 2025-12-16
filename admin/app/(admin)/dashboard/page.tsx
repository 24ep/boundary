'use client'

import React, { useState, useEffect } from 'react'
import { authService } from '../../../services/authService'
import { API_BASE_URL } from '../../../services/apiConfig'

interface DashboardStats {
    totalUsers: number
    totalContent: number
    totalViews: number
    activeUsers: number
}

interface RecentActivity {
    id: string
    type: 'create' | 'update' | 'publish' | 'login'
    title: string
    timestamp: string
    user: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalContent: 0,
        totalViews: 0,
        activeUsers: 0
    })
    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate loading stats (replace with actual API calls)
        const timer = setTimeout(() => {
            setStats({
                totalUsers: 156,
                totalContent: 48,
                totalViews: 12540,
                activeUsers: 23
            })
            setActivities([
                { id: '1', type: 'publish', title: 'Home Page Updated', timestamp: '2 hours ago', user: 'Admin' },
                { id: '2', type: 'create', title: 'New Blog Post', timestamp: '4 hours ago', user: 'Editor' },
                { id: '3', type: 'login', title: 'User Login', timestamp: '5 hours ago', user: 'admin@bondarys.com' },
                { id: '4', type: 'update', title: 'Settings Modified', timestamp: '1 day ago', user: 'Admin' }
            ])
            setLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    const getActivityIcon = (type: string) => {
        const icons: Record<string, { bg: string; icon: string }> = {
            publish: { bg: 'bg-green-100 text-green-600', icon: '🚀' },
            create: { bg: 'bg-blue-100 text-blue-600', icon: '✨' },
            update: { bg: 'bg-yellow-100 text-yellow-600', icon: '✏️' },
            login: { bg: 'bg-purple-100 text-purple-600', icon: '👤' }
        }
        return icons[type] || { bg: 'bg-gray-100 text-gray-600', icon: '📌' }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change="+12%"
                    changeType="positive"
                    icon="👥"
                />
                <StatCard
                    title="Total Content"
                    value={stats.totalContent}
                    change="+5"
                    changeType="positive"
                    icon="📄"
                />
                <StatCard
                    title="Total Views"
                    value={stats.totalViews.toLocaleString()}
                    change="+24%"
                    changeType="positive"
                    icon="👁️"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    change="-2"
                    changeType="negative"
                    icon="🟢"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {activities.map((activity) => {
                            const iconConfig = getActivityIcon(activity.type)
                            return (
                                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconConfig.bg}`}>
                                        {iconConfig.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-sm text-gray-500">{activity.user}</p>
                                    </div>
                                    <div className="text-xs text-gray-400">{activity.timestamp}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <QuickActionButton icon="📄" label="New Page" href="/pages" />
                        <QuickActionButton icon="📝" label="New Content" href="/content" />
                        <QuickActionButton icon="👤" label="Add User" href="/admin/users" />
                        <QuickActionButton icon="📁" label="Upload Media" href="/media" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Stat Card Component
function StatCard({
    title,
    value,
    change,
    changeType,
    icon
}: {
    title: string
    value: string | number
    change: string
    changeType: 'positive' | 'negative'
    icon: string
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div className="text-2xl">{icon}</div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeType === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {change}
                </span>
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    )
}

// Quick Action Button Component
function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
    return (
        <a
            href={href}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
            <span className="text-2xl mb-2">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </a>
    )
}
