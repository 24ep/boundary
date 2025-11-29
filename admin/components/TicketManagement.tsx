'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  TicketIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface Ticket {
  id: string
  title: string
  description: string
  type: 'post_report' | 'user_complaint' | 'technical_issue' | 'feature_request' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  reporter: {
    id: string
    name: string
    email: string
    familyId: string
    familyName: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  tags?: string[]
  attachments?: string[]
  comments?: TicketComment[]
}

interface TicketComment {
  id: string
  content: string
  author: {
    id: string
    name: string
    role: 'admin' | 'user' | 'system'
  }
  createdAt: string
  isInternal: boolean
}

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  overdue: number
  avgResolutionTime: number
}

export function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    overdue: 0,
    avgResolutionTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [showTicketDrawer, setShowTicketDrawer] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setTickets([])
      setStats({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        overdue: 0,
        avgResolutionTime: 0
      })
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesType = filterType === 'all' || ticket.type === filterType
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'red'
      case 'in_progress': return 'blue'
      case 'resolved': return 'green'
      case 'closed': return 'gray'
      case 'cancelled': return 'gray'
      default: return 'gray'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post_report': return <FlagIcon className="h-5 w-5" />
      case 'user_complaint': return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'technical_issue': return <TicketIcon className="h-5 w-5" />
      case 'feature_request': return <ChatBubbleLeftRightIcon className="h-5 w-5" />
      default: return <TicketIcon className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 section bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Ticket Management</h2>
          <p className="text-gray-600 text-lg">Manage support tickets, reports, and user complaints</p>
        </div>
        <button 
          onClick={() => setShowCreateTicket(true)} 
          className="btn btn-primary flex items-center gap-3 px-6 py-3 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Create Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Open</p>
              <p className="text-3xl font-bold text-red-600">{stats.open}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stats-card rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="section">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Filters & Search</h3>
          <p className="text-gray-600">Filter and search through tickets</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
              Search Tickets
            </label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <FunnelIcon className="h-4 w-4 inline mr-2" />
              Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <TagIcon className="h-4 w-4 inline mr-2" />
              Type Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select select-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Types</option>
              <option value="post_report">Post Report</option>
              <option value="user_complaint">User Complaint</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="feature_request">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <FlagIcon className="h-4 w-4 inline mr-2" />
              Priority Filter
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="select select-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="table-container">
        <div className="table-title">
          <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
          <p className="text-sm text-gray-600">Manage and track all support tickets</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="table-head">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="table-row"
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setShowTicketDrawer(true)
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">#{ticket.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{ticket.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {ticket.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400">
                        {getTypeIcon(ticket.type)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {ticket.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{ticket.reporter.name}</div>
                        <div className="text-xs text-gray-500 truncate">{ticket.reporter.familyName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTicket(ticket)
                          setShowTicketDrawer(true)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-150"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Create New Ticket</h3>
                  <p className="text-sm text-gray-600">Fill out the form below to create a new support ticket</p>
                </div>
                <button
                  onClick={() => setShowCreateTicket(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <PlusIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Create Ticket Form</h4>
                <p className="text-gray-600 mb-6">Create ticket functionality coming soon...</p>
                <button
                  onClick={() => setShowCreateTicket(false)}
                  className="btn btn-secondary px-6 py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {isClient && showTicketDrawer && selectedTicket && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop */}
          <div 
            className="drawer-overlay"
            onClick={() => setShowTicketDrawer(false)}
          />
          
          {/* Drawer */}
          <div className="drawer-panel">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedTicket.title}</h3>
                    <p className="text-sm text-gray-600">Ticket #{selectedTicket.id}</p>
                  </div>
                  <button
                    onClick={() => setShowTicketDrawer(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 leading-relaxed">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {getTypeIcon(selectedTicket.type)}
                      </div>
                      <span className="text-gray-900 font-medium capitalize">
                        {selectedTicket.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTicket.status === 'open' ? 'bg-red-100 text-red-800' :
                      selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reporter</label>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{selectedTicket.reporter.name}</div>
                      <div className="text-sm text-gray-600">{selectedTicket.reporter.email}</div>
                      <div className="text-sm text-gray-500">{selectedTicket.reporter.familyName}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span>{new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div className="bg-white rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Comments</label>
                  <div className="space-y-3">
                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                      selectedTicket.comments.map((comment, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                            <span className="text-xs text-gray-500">{comment.author.role}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between gap-3">
                  <button
                    className="btn btn-secondary px-6 py-2 rounded-lg"
                    onClick={() => setShowTicketDrawer(false)}
                  >
                    Close
                  </button>
                  <div className="flex gap-2">
                    <button className="btn btn-primary px-6 py-2 rounded-lg">
                      Edit Ticket
                    </button>
                    <button className="btn btn-outline px-6 py-2 rounded-lg">
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
