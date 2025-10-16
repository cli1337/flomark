import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from './ui/Button';
import { boardService } from '../services/boardService';
import { useToast } from '../contexts/ToastContext';

const BoardTabs = ({ 
  boards, 
  activeBoard, 
  onBoardChange, 
  onBoardsUpdate, 
  projectId,
  canManage = false 
}) => {
  const { showSuccess, showError } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBoard = async () => {
    if (!boardName.trim()) {
      showError('Board name is required', 'Please enter a board name');
      return;
    }

    if (boards.length >= 10) {
      showError('Board Limit Reached', 'Maximum of 10 boards per project');
      return;
    }

    setLoading(true);
    try {
      const response = await boardService.createBoard(projectId, boardName.trim());
      if (response.success) {
        showSuccess('Board Created', 'Board has been created successfully');
        setBoardName('');
        setShowAddModal(false);
        onBoardsUpdate?.();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create board';
      showError('Failed to Create Board', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBoard = async () => {
    if (!boardName.trim()) {
      showError('Board name is required', 'Please enter a board name');
      return;
    }

    setLoading(true);
    try {
      const response = await boardService.updateBoard(editingBoard.id, { name: boardName.trim() });
      if (response.success) {
        showSuccess('Board Updated', 'Board has been updated successfully');
        setBoardName('');
        setEditingBoard(null);
        setShowEditModal(false);
        onBoardsUpdate?.();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update board';
      showError('Failed to Update Board', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    setLoading(true);
    try {
      const response = await boardService.deleteBoard(editingBoard.id);
      if (response.success) {
        showSuccess('Board Deleted', 'Board has been deleted successfully');
        setEditingBoard(null);
        setShowDeleteModal(false);
        onBoardsUpdate?.();
        
        // If deleted board was active, switch to first board or null
        if (activeBoard?.id === editingBoard.id) {
          const remainingBoards = boards.filter(b => b.id !== editingBoard.id);
          onBoardChange(remainingBoards.length > 0 ? remainingBoards[0] : null);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete board';
      showError('Failed to Delete Board', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (board) => {
    setEditingBoard(board);
    setBoardName(board.name);
    setShowEditModal(true);
  };

  const openDeleteModal = (board) => {
    setEditingBoard(board);
    setShowDeleteModal(true);
  };

  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 sm:px-16 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {boards.length === 0 && canManage && (
          <div className="flex items-center gap-2 text-gray-400 text-sm mr-4">
            <span>No boards yet. Create your first board →</span>
          </div>
        )}
        {boards.map((board) => (
          <div
            key={board.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap min-w-0 border ${
              activeBoard?.id === board.id
                ? 'bg-white/10 border-white/20 text-white shadow-lg'
                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'
            }`}
          >
            {canManage && (
              <GripVertical className="h-4 w-4 text-gray-500 flex-shrink-0 cursor-grab" />
            )}
            <button
              onClick={() => onBoardChange(board)}
              className="flex-1 text-sm font-semibold truncate max-w-[200px]"
              title={board.name}
            >
              {board.name}
            </button>
            {canManage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(board);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                title="Edit board"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        
        {canManage && boards.length < 10 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-semibold"
            title="Add board"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Board</span>
          </button>
        )}
        
        {!canManage && boards.length === 0 && (
          <div className="text-gray-500 text-sm italic px-4 py-2">
            No boards available. Contact project owner to create boards.
          </div>
        )}
      </div>

      {/* Add Board Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Add New Board</h3>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 mb-4"
              maxLength={50}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleAddBoard()}
            />
            <div className="text-xs text-gray-500 mb-4">
              {boards.length}/10 boards created
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setBoardName('');
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBoard}
                disabled={loading || !boardName.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Board'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Edit Board</h3>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 mb-4"
              maxLength={50}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleEditBoard()}
            />
            <div className="flex gap-3 justify-between">
              <Button
                onClick={() => {
                  openDeleteModal(editingBoard);
                  setShowEditModal(false);
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 border border-red-500/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setBoardName('');
                    setEditingBoard(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditBoard}
                  disabled={loading || !boardName.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-2">Delete Board</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete "{editingBoard?.name}"? This will delete all lists and tasks in this board. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEditingBoard(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBoard}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Board'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardTabs;

