'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/config/api'
import { Card, Button } from '@/components/ui'
import { ChatBubbleLeftRightIcon, HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline'

interface Post {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  created_at: string
  likes_count?: number
  comments_count?: number
  media?: string[]
}

export default function SocialPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
    
    // Listen for new posts via socket
    const handleNewPost = (event: CustomEvent) => {
      setPosts((prev) => [event.detail, ...prev])
    }
    
    window.addEventListener('social:new_post', handleNewPost as EventListener)
    return () => window.removeEventListener('social:new_post', handleNewPost as EventListener)
  }, [])

  const loadPosts = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SOCIAL.POSTS)
      setPosts(response.data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-macos-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Feed</h1>
          <p className="text-gray-600 mt-1">Stay connected with your family</p>
        </div>
        <Button variant="primary">Create Post</Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share something with your family</p>
            <Button variant="primary">Create Post</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-macos-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-macos-blue-600 font-medium">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{post.author.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.media.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Post media ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-macos"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-macos">
                      <HeartIcon className="w-5 h-5" />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-macos-blue-600 transition-macos">
                      <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

