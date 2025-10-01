import React, { useState, useEffect } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { 
  Tag, 
  Plus, 
  Search, 
  X,
  Edit,
  Trash2,
  Check,
  Loader2
} from 'lucide-react'
import { labelService } from '../services/labelService'
import { useToast } from '../contexts/ToastContext'

const LabelFilter = ({ projectId, selectedLabels = [], onLabelsChange }) => {
  const { showSuccess, showError } = useToast()
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6')
  const [creatingLabel, setCreatingLabel] = useState(false)
  const [editingLabel, setEditingLabel] = useState(null)

  const labelColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#6b7280'
  ]

  useEffect(() => {
    if (projectId) {
      fetchLabels()
    }
  }, [projectId])

  const fetchLabels = async () => {
    setLoading(true)
    try {
      const response = await labelService.getProjectLabels(projectId)
      if (response.success) {
        setLabels(response.data || [])
      }
    } catch (error) {
      showError('Failed to Load Labels', 'Could not fetch project labels')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return

    setCreatingLabel(true)
    try {
      const response = await labelService.createLabel(projectId, {
        name: newLabelName,
        color: newLabelColor
      })
      if (response.success) {
        setLabels(prev => [...prev, response.data])
        setNewLabelName('')
        setShowCreateForm(false)
        showSuccess('Label Created', 'New label has been created successfully')
      }
    } catch (error) {
      showError('Failed to Create Label', 'Could not create new label')
    } finally {
      setCreatingLabel(false)
    }
  }

  const handleUpdateLabel = async (labelId, name, color) => {
    try {
      const response = await labelService.updateLabel(labelId, { name, color })
      if (response.success) {
        setLabels(prev => prev.map(label => 
          label.id === labelId ? { ...label, name, color } : label
        ))
        setEditingLabel(null)
        showSuccess('Label Updated', 'Label has been updated successfully')
      }
    } catch (error) {
      showError('Failed to Update Label', 'Could not update label')
    }
  }

  const handleDeleteLabel = async (labelId) => {
    try {
      const response = await labelService.deleteLabel(labelId)
      if (response.success) {
        setLabels(prev => prev.filter(label => label.id !== labelId))
        onLabelsChange?.(selectedLabels.filter(id => id !== labelId))
        showSuccess('Label Deleted', 'Label has been deleted successfully')
      }
    } catch (error) {
      showError('Failed to Delete Label', 'Could not delete label')
    }
  }

  const toggleLabelSelection = (labelId) => {
    const newSelection = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId]
    onLabelsChange?.(newSelection)
  }

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Tag className="h-4 w-4 mr-2" />
          Labels: {selectedLabels.length > 0 ? selectedLabels.length : 'All'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-medium mb-3">Filter By Labels</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredLabels.map((label) => (
                <div key={label.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleLabelSelection(label.id)}
                    className="flex items-center gap-2 flex-1 text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-white text-sm">{label.name}</span>
                    {selectedLabels.includes(label.id) && (
                      <Check className="h-4 w-4 text-green-400 ml-auto" />
                    )}
                  </button>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setEditingLabel(label)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit className="h-3 w-3 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}

              {!showCreateForm && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="ghost"
                  className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new label
                </Button>
              )}

              {showCreateForm && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Label name..."
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    
                    <div>
                      <p className="text-gray-300 text-sm mb-2">Color:</p>
                      <div className="grid grid-cols-9 gap-2">
                        {labelColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewLabelColor(color)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              newLabelColor === color ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateLabel}
                        disabled={!newLabelName.trim() || creatingLabel}
                        className="flex-1 bg-white hover:bg-gray-100 text-black"
                      >
                        {creatingLabel ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          'Create'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewLabelName('')
                        }}
                        variant="ghost"
                        className="text-gray-300 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LabelFilter
