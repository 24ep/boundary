'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface Family {
  id: string
  name: string
  description: string
  memberCount: number
}

interface Note {
  id: string
  title: string
  content: string
  familyId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isPinned: boolean
  isShared: boolean
  category: 'meeting' | 'recipe' | 'memory' | 'reminder' | 'important' | 'other'
  priority: 'low' | 'medium' | 'high'
  attachments: string[]
}

export function Notes() {
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    category: 'other',
    priority: 'medium',
    isPinned: false,
    isShared: false
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyNotes()
    }
  }, [selectedFamily])

  const loadData = async () => {
    setLoading(true)
    try {
      setFamilies([])
      setSelectedFamily('')
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFamilyNotes = async () => {
    if (!selectedFamily) return
    
    try {
      setNotes([])
    } catch (error) {
      console.error('Error loading family notes:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority
    return matchesSearch && matchesCategory && matchesPriority
  })

  const handleCreate = () => {
    setEditingNote(null)
    setFormData({
      title: '',
      content: '',
      tags: [],
      category: 'other',
      priority: 'medium',
      isPinned: false,
      isShared: false
    })
    setShowForm(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      category: note.category,
      priority: note.priority,
      isPinned: note.isPinned,
      isShared: note.isShared
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (editingNote) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...formData, updatedAt: new Date().toISOString() }
          : note
      ))
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        ...formData,
        familyId: selectedFamily,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: []
      }
      setNotes(prev => [...prev, newNote])
    }
    setShowForm(false)
    setEditingNote(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== id))
    }
  }

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
        : note
    ))
  }

  const handleToggleShare = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, isShared: !note.isShared, updatedAt: new Date().toISOString() }
        : note
    ))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'blue'
      case 'recipe': return 'green'
      case 'memory': return 'pink'
      case 'reminder': return 'yellow'
      case 'important': return 'red'
      default: return 'gray'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getSelectedFamilyName = () => {
    const family = families.find(f => f.id === selectedFamily)
    return family?.name || 'Select Family'
  }

  const formatContent = (content: string) => {
    if (content.length > 150) {
      return content.substring(0, 150) + '...'
    }
    return content
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Family Notes</h2>
          <p className="text-gray-600">Manage notes and documentation for families</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Note
        </button>
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
                  {family.name} ({family.memberCount} members)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedFamily && (
        <>
          {/* Notes Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-number text-blue-600">{notes.length}</div>
              <div className="stat-label">Total Notes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-green-600">
                {notes.filter(n => n.isPinned).length}
              </div>
              <div className="stat-label">Pinned Notes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-purple-600">
                {notes.filter(n => n.isShared).length}
              </div>
              <div className="stat-label">Shared Notes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-orange-600">
                {notes.filter(n => n.priority === 'high').length}
              </div>
              <div className="stat-label">High Priority</div>
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
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="all">All Categories</option>
                  <option value="meeting">Meeting</option>
                  <option value="recipe">Recipe</option>
                  <option value="memory">Memory</option>
                  <option value="reminder">Reminder</option>
                  <option value="important">Important</option>
                  <option value="other">Other</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><DocumentTextIcon className="h-12 w-12 text-gray-400" /></div>
              <h3 className="empty-state-title">No notes found</h3>
              <p className="empty-state-description">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first note to get started.'}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                                {note.isPinned && (
                                  <BookmarkIcon className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className={`badge badge-${getCategoryColor(note.category)}`}>
                                  {note.category}
                                </span>
                                <span className={`badge badge-${getPriorityColor(note.priority)}`}>
                                  {note.priority}
                                </span>
                                {note.isShared && (
                                  <span className="badge badge-info">
                                    Shared
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{formatContent(note.content)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            {note.tags.map(tag => (
                              <span key={tag} className="badge badge-sm badge-info">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {note.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                            {note.attachments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <TagIcon className="h-4 w-4" />
                                {note.attachments.length} attachments
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(note)}
                            className="btn btn-ghost text-blue-600 hover:text-blue-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            className={`btn btn-ghost ${note.isPinned ? 'text-yellow-600' : 'text-gray-600'} hover:text-yellow-700`}
                          >
                            <BookmarkIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleShare(note.id)}
                            className={`btn btn-ghost ${note.isShared ? 'text-green-600' : 'text-gray-600'} hover:text-green-700`}
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
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
        </>
      )}

      {/* Note Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingNote ? 'Edit Note' : 'Create Note'} for {getSelectedFamilyName()}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="form-group">
                <label className="form-label">Note Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="form-input"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="recipe">Recipe</option>
                    <option value="memory">Memory</option>
                    <option value="reminder">Reminder</option>
                    <option value="important">Important</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                  className="form-input"
                  placeholder="e.g., meeting, planning, important"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="form-checkbox mr-2"
                  />
                  Pin Note
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                    className="form-checkbox mr-2"
                  />
                  Share with Family
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}