import React, { useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import { listService } from '../services/listService'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/Dialog'
import { X, Plus, Palette } from 'lucide-react'

const CreateColumnModal = ({ isOpen, onClose, projectId, onColumnCreated }) => {
  const { showSuccess, showError } = useToast()
  const [columnName, setColumnName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [isCreating, setIsCreating] = useState(false)

  const predefinedColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6b7280', // Gray
    '#14b8a6', // Teal
    '#a855f7', // Violet
  ]

  const handleCreateColumn = async () => {
    if (!columnName.trim()) {
      showError('Column name is required', 'Please enter a column name')
      return
    }

    if (columnName.length < 2 || columnName.length > 30) {
      showError('Invalid column name', 'Column name must be between 2 and 30 characters')
      return
    }

    setIsCreating(true)
    try {
      const response = await listService.createList(projectId, columnName, selectedColor)
      if (response.success) {
        showSuccess('Column Created', `"${columnName}" has been created successfully`)
        setColumnName('')
        setSelectedColor('#3b82f6')
        onClose()
        if (onColumnCreated) {
          onColumnCreated(response.data)
        }
      } else {
        showError('Failed to create column', response.message)
      }
    } catch (error) {
      console.error('Error creating column:', error)
      showError('Failed to create column', 'Please try again later')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setColumnName('')
    setSelectedColor('#3b82f6')
    setIsCreating(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreateColumn()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/10 border-white/20 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Column
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new column to organize your tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Column Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Column Name
            </label>
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., To Do, In Progress, Done"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
              disabled={isCreating}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              {columnName.length}/30 characters
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Column Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? 'border-white shadow-lg scale-110'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isCreating}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {columnName.trim() && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Preview
              </label>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <h3 className="text-gray-400 font-bold text-xs tracking-wider uppercase">
                    {columnName} (0)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is how your column will appear
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleClose}
            disabled={isCreating}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateColumn}
            disabled={isCreating || !columnName.trim()}
            className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Column
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateColumnModal
