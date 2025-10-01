import React, { useState, useEffect } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { Button } from './ui/Button'
import { 
  Users, 
  Search, 
  Plus,
  Check,
  Loader2
} from 'lucide-react'
import { memberService } from '../services/memberService'
import { useToast } from '../contexts/ToastContext'

const MemberFilter = ({ projectId, projectOwner, selectedMembers = [], onMembersChange }) => {
  const { showSuccess, showError } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchMembers()
    }
  }, [projectId])

  useEffect(() => {
    if (projectOwner) {
      setMembers(prev => {
        const ownerExists = prev.some(member => member.id === projectOwner.id)
        if (!ownerExists) {
          return [{ ...projectOwner, isOwner: true }, ...prev]
        }
        return prev.map(member => 
          member.id === projectOwner.id ? { ...member, isOwner: true } : member
        )
      })
    }
  }, [projectOwner])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = await memberService.getProjectMembers(projectId)
      if (response.success) {
        const membersWithOwner = response.data.map(member => ({
          ...member,
          isOwner: member.id === projectOwner?.id
        }))
        setMembers(membersWithOwner)
      }
    } catch (error) {
      showError('Failed to Load Members', 'Could not fetch project members')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await memberService.searchUsers(query)
      if (response.success) {
        const filteredResults = response.data.filter(user => 
          !members.some(member => member.id === user.id)
        )
        setSearchResults(filteredResults)
      }
    } catch (error) {
      showError('Search Failed', 'Could not search for users')
    } finally {
      setSearching(false)
    }
  }

  const handleAddMember = async (userId) => {
    try {
      const response = await memberService.addMemberToProject(projectId, userId)
      if (response.success) {
        const newMember = searchResults.find(user => user.id === userId)
        setMembers(prev => [...prev, newMember])
        setSearchResults(prev => prev.filter(user => user.id !== userId))
        showSuccess('Member Added', 'User has been added to the project')
      }
    } catch (error) {
      showError('Failed to Add Member', 'Could not add user to project')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (userId === projectOwner?.id) return

    try {
      const response = await memberService.removeMemberFromProject(projectId, userId)
      if (response.success) {
        setMembers(prev => prev.filter(member => member.id !== userId))
        onMembersChange?.(selectedMembers.filter(id => id !== userId))
        showSuccess('Member Removed', 'User has been removed from the project')
      }
    } catch (error) {
      showError('Failed to Remove Member', 'Could not remove user from project')
    }
  }

  const toggleMemberSelection = (memberId) => {
    const newSelection = selectedMembers.includes(memberId)
      ? selectedMembers.filter(id => id !== memberId)
      : [...selectedMembers, memberId]
    onMembersChange?.(newSelection)
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Users className="h-4 w-4 mr-2" />
          Members: {selectedMembers.length > 0 ? selectedMembers.length : 'All'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-medium mb-3">Filter By Members</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearchUsers(e.target.value)
              }}
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
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleMemberSelection(member.id)}
                    className="flex items-center gap-3 flex-1 text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-semibold text-white">
                      {member.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {member.name}
                        {member.isOwner && (
                          <span className="ml-2 text-xs text-yellow-400">Owner</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs">{member.email}</div>
                    </div>
                    {selectedMembers.includes(member.id) && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </button>
                  
                  {!member.isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Users className="h-3 w-3 text-red-400" />
                    </button>
                  )}
                </div>
              ))}

              {searchResults.length > 0 && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-gray-300 text-sm mb-2">Add Members:</p>
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-semibold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{user.name}</div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user.id)}
                        className="p-1 hover:bg-green-500/20 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4 text-green-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400 text-sm">Searching...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MemberFilter
