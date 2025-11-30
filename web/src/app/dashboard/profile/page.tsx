'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Input } from '@/components/ui'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Update profile logic
    console.log('Updating profile:', formData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-macos-blue-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-macos-blue-600" />
              </div>
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="lastName"
                label="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />

            <Input
              type="tel"
              name="phone"
              label="Phone number"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary" type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">Change Password</Button>
            <Button variant="outline" className="w-full justify-start">Privacy Settings</Button>
            <Button variant="outline" className="w-full justify-start">Notification Preferences</Button>
            <div className="pt-4 border-t border-gray-200">
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

