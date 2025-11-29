'use client'

import { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  FlagIcon,
  TrashIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { socialMediaService, Family, SocialPost, SocialComment, SocialReport, SocialActivity } from '../services/socialMediaService'

// Interfaces are now imported from the service

export function SocialMedia() {
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('all')
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [comments, setComments] = useState<SocialComment[]>([])
  const [reports, setReports] = useState<SocialReport[]>([])
  const [activities, setActivities] = useState<SocialActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterReported, setFilterReported] = useState('all')
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationAction, setModerationAction] = useState<'hide' | 'delete' | 'approve'>('hide')
  const [moderationReason, setModerationReason] = useState('')
  const [notifyUser, setNotifyUser] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedFamily) {
      loadSocialMediaData()
    }
  }, [selectedFamily])

  const loadData = async () => {
    setLoading(true)
    try {
      const familiesData = await socialMediaService.getFamilies()
      const allFamiliesOption: Family = { 
        id: 'all', 
        name: 'All Families', 
        description: 'View all families', 
        member_count: 0 
      }
      setFamilies([allFamiliesOption, ...familiesData])
      setSelectedFamily('all')
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSocialMediaData = async () => {
    try {
      // Load posts with filters
      const postsData = await socialMediaService.getPosts({
        familyId: selectedFamily,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        reported: filterReported === 'reported' ? true : filterReported === 'not_reported' ? false : undefined,
        search: searchTerm || undefined
      })

      // Load comments for all posts
      const commentsData = await socialMediaService.getComments(postsData[0]?.id || '')
      
      // Load reports
      const reportsData = await socialMediaService.getReports()
      
      // Load activities for all posts
      const activitiesData = await socialMediaService.getActivities(postsData[0]?.id || '')

      setPosts(postsData)
      setComments(commentsData)
      setReports(reportsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading social media data:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFamily = selectedFamily === 'all' || post.family_id === selectedFamily
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.author?.first_name + ' ' + post.author?.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    const matchesType = filterType === 'all' || post.type === filterType
    const matchesReported = filterReported === 'all' || 
                           (filterReported === 'reported' && post.is_reported) ||
                           (filterReported === 'not_reported' && !post.is_reported)
    return matchesFamily && matchesSearch && matchesStatus && matchesType && matchesReported
  })

  const handleModeratePost = (post: SocialPost, action: 'hide' | 'delete' | 'approve') => {
    setSelectedPost(post)
    setModerationAction(action)
    setModerationReason('')
    setNotifyUser(true)
    setShowModerationModal(true)
  }

  const handleConfirmModeration = async () => {
    if (!selectedPost) return

    try {
      let updates: any = {}
      
      if (moderationAction === 'hide') {
        updates = { is_hidden: true, status: 'hidden' }
      } else if (moderationAction === 'delete') {
        updates = { is_deleted: true, status: 'deleted' }
      } else if (moderationAction === 'approve') {
        updates = { is_hidden: false, status: 'active' }
      }

      const updatedPost = await socialMediaService.updatePost(selectedPost.id, updates)
      
      setPosts(prev => prev.map(post => 
        post.id === selectedPost.id ? updatedPost : post
      ))

      // TODO: Send notification to user if notifyUser is true
      if (notifyUser && moderationAction !== 'approve') {
        // Send notification about moderation action
        console.log(`Notifying user about ${moderationAction}: ${moderationReason}`)
      }

      setShowModerationModal(false)
      setSelectedPost(null)
    } catch (error) {
      console.error('Error moderating post:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'hidden': return 'yellow'
      case 'deleted': return 'red'
      case 'under_review': return 'blue'
      default: return 'gray'
    }
  }

  const getReportReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'yellow'
      case 'inappropriate': return 'orange'
      case 'harassment': return 'red'
      case 'violence': return 'red'
      case 'other': return 'gray'
      default: return 'gray'
    }
  }

  const getSelectedFamilyName = () => {
    const family = families.find(f => f.id === selectedFamily)
    return family?.name || 'All Families'
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Social Media Management</h2>
              <p className="text-gray-600">Monitor posts, comments, reports, and moderate content</p>
            </div>
          </div>

          {/* Family Selection */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <label className="form-label">Select Family:</label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="form-select w-auto"
                >
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name} {family.member_count > 0 && `(${family.member_count} members)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Social Media Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-number text-blue-600">{posts.length}</div>
              <div className="stat-label">Total Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-green-600">
                {posts.filter(p => p.status === 'active').length}
              </div>
              <div className="stat-label">Active Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-red-600">
                {posts.filter(p => p.is_reported).length}
              </div>
              <div className="stat-label">Reported Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-orange-600">
                {posts.reduce((sum, post) => sum + post.likes_count + post.shares_count + post.comments_count, 0)}
              </div>
              <div className="stat-label">Total Engagement</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts, users, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                  <option value="deleted">Deleted</option>
                  <option value="under_review">Under Review</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="event">Event</option>
                </select>
                
                <select
                  value={filterReported}
                  onChange={(e) => setFilterReported(e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="all">All Posts</option>
                  <option value="reported">Reported</option>
                  <option value="not_reported">Not Reported</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📱</div>
              <h3 className="empty-state-title">No posts found</h3>
              <p className="empty-state-description">
                {searchTerm ? 'Try adjusting your search terms.' : 'No posts available for the selected family.'}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {post.author?.avatar_url ? (
                                <img src={post.author.avatar_url} alt={`${post.author.first_name} ${post.author.last_name}`} className="w-10 h-10 rounded-full" />
                              ) : (
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-semibold text-gray-900">{post.author?.first_name} {post.author?.last_name}</h4>
                                <span className="badge badge-info">{post.family?.name}</span>
                                <span className={`badge badge-${getStatusColor(post.status)}`}>
                                  {post.status.replace('_', ' ')}
                                </span>
                                {post.is_reported && (
                                  <span className="badge badge-red">Reported ({post.report_count})</span>
                                )}
                                {post.is_hidden && (
                                  <span className="badge badge-yellow">Hidden</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <EyeIcon className="h-4 w-4" />
                                  {post.views_count} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="h-4 w-4" />
                                  {post.visibility}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-800">{post.content}</p>
                            {post.media_urls && post.media_urls.length > 0 && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {post.media_urls.map((url, index) => (
                                  <img key={index} src={url} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <HeartIcon className="h-4 w-4" />
                              {post.likes_count} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <ShareIcon className="h-4 w-4" />
                              {post.shares_count} shares
                            </span>
                            <span className="flex items-center gap-1">
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              {post.comments_count} comments
                            </span>
                          </div>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              {post.tags.map(tag => (
                                <span key={tag} className="badge badge-sm badge-info">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setShowPostDetail(true);
                            }}
                            className="btn btn-ghost text-blue-600 hover:text-blue-700"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {post.status === 'active' && (
                            <button
                              onClick={() => handleModeratePost(post, 'hide')}
                              className="btn btn-ghost text-yellow-600 hover:text-yellow-700"
                            >
                              <EyeSlashIcon className="h-4 w-4" />
                            </button>
                          )}
                          {post.status === 'hidden' && (
                            <button
                              onClick={() => handleModeratePost(post, 'approve')}
                              className="btn btn-ghost text-green-600 hover:text-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleModeratePost(post, 'delete')}
                            className="btn btn-ghost text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Post Detail Modal */}
          {showPostDetail && selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Post Details</h3>
                  <button
                    onClick={() => setShowPostDetail(false)}
                    className="btn btn-ghost"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Post Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Author:</span>
                        <span>{selectedPost.author?.first_name} {selectedPost.author?.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Family:</span>
                        <span>{selectedPost.family?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span>{selectedPost.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`badge badge-${getStatusColor(selectedPost.status)}`}>
                          {selectedPost.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Visibility:</span>
                        <span>{selectedPost.visibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2 mt-4">Engagement</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-semibold text-red-500">{selectedPost.likes_count}</div>
                        <div className="text-gray-500">Likes</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-semibold text-blue-500">{selectedPost.shares_count}</div>
                        <div className="text-gray-500">Shares</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-semibold text-green-500">{selectedPost.comments_count}</div>
                        <div className="text-gray-500">Comments</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-semibold text-purple-500">{selectedPost.views_count}</div>
                        <div className="text-gray-500">Views</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reports</h4>
                    {reports.filter(r => r.post_id === selectedPost.id).length > 0 ? (
                      <div className="space-y-2">
                        {reports.filter(r => r.post_id === selectedPost.id).map(report => (
                          <div key={report.id} className="border border-gray-200 rounded p-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">{report.reporter?.first_name} {report.reporter?.last_name}</span>
                              <span className={`badge badge-${getReportReasonColor(report.reason)}`}>
                                {report.reason}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{report.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(report.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No reports for this post</p>
                    )}
                    
                    <h4 className="font-medium text-gray-900 mb-2 mt-4">Recent Activity</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {activities.filter(a => a.post_id === selectedPost.id).slice(0, 5).map(activity => (
                        <div key={activity.id} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{activity.user?.first_name} {activity.user?.last_name}</span>
                          <span className="text-gray-500">{activity.action}</span>
                          <span className="text-gray-400 text-xs">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Moderation Modal */}
          {showModerationModal && selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {moderationAction === 'hide' ? 'Hide Post' : 
                   moderationAction === 'delete' ? 'Delete Post' : 
                   'Approve Post'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Reason (optional)</label>
                    <textarea
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="form-input"
                      rows={3}
                      placeholder="Enter reason for this action..."
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifyUser}
                      onChange={(e) => setNotifyUser(e.target.checked)}
                      className="form-checkbox mr-2"
                    />
                    <label className="text-sm">Notify user about this action</label>
                  </div>
                  
                  {notifyUser && moderationReason && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        User will be notified: "{moderationReason}"
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleConfirmModeration}
                    className={`btn ${
                      moderationAction === 'delete' ? 'btn-danger' : 
                      moderationAction === 'hide' ? 'btn-warning' : 
                      'btn-success'
                    }`}
                  >
                    {moderationAction === 'hide' ? 'Hide Post' : 
                     moderationAction === 'delete' ? 'Delete Post' : 
                     'Approve Post'}
                  </button>
                  <button
                    onClick={() => setShowModerationModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}