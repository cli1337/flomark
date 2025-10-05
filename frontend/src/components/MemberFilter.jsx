import React, { useState, useEffect } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { Button } from './ui/Button'
import LoadingSpinner from './ui/LoadingSpinner'
import { 
  Users, 
  Search, 
  Plus,
  Check,
  Crown,
  UserMinus,
  UserPlus,
  User,
  X
} from 'lucide-react'
import { memberService } from '../services/memberService'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const MemberFilter = ({ projectId, projectOwner, selectedMembers = [], onMembersChange }) => {
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(null)

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

  const handleRemoveMember = async (memberId) => {
    if (memberId === projectOwner?.id) return
    
    if (memberId === user?.id) {
      showError('Cannot Remove Yourself', 'You cannot remove yourself from the project. Ask another admin to remove you if needed.')
      return
    }

    try {
      const response = await memberService.removeMemberFromProject(projectId, memberId)
      if (response.success) {
        setMembers(prev => prev.filter(member => member.id !== memberId))
        onMembersChange?.(selectedMembers.filter(id => id !== memberId))
        showSuccess('Member Removed', 'User has been removed from the project')
      }
    } catch (error) {
      showError('Failed to Remove Member', 'Could not remove user from project')
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    setUpdatingRole(memberId)
    try {
      const response = await memberService.updateMemberRole(projectId, memberId, newRole)
      if (response.success) {
        setMembers(prev => prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        ))
        showSuccess('Role Updated', `Member role has been updated to ${newRole}`)
      }
    } catch (error) {
      showError('Failed to Update Role', 'Could not update member role')
    } finally {
      setUpdatingRole(null)
    }
  }

  const isOwner = user?.id === projectOwner?.id
  
  const currentUserMember = members.find(member => member.userId === user?.id || member.id === user?.id)
  const isAdmin = currentUserMember?.role === 'ADMIN'
  const canManageRoles = isOwner

  const toggleMemberSelection = (memberId) => {
    const newSelection = selectedMembers.includes(memberId)
      ? selectedMembers.filter(id => id !== memberId)
      : [...selectedMembers, memberId]
    onMembersChange?.(newSelection)
  }

  const filteredMembers = members.filter(member =>
    (member.name || member.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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
              <LoadingSpinner size="h-6 w-6" className="text-gray-400" />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredMembers.map((member) => {
                const userName = member.user?.name || member.name || 'Unknown User'
                const userEmail = member.user?.email || member.email || ''
                const userInitial = userName.charAt(0).toUpperCase()
                const isMemberOwner = member.role === 'OWNER' || member.isOwner
                const isMemberAdmin = member.role === 'ADMIN'
                const isCurrentUser = member.userId === user?.id || member.id === user?.id
                const canManage = canManageRoles && !isMemberOwner && !isCurrentUser
                
                return (
                  <div key={member.id} className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleMemberSelection(member.id)}
                      className="flex items-center gap-3 flex-1 text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-all duration-200 ${
                        isMemberOwner ? 'bg-yellow-500' : isMemberAdmin ? 'bg-blue-500' : 'bg-gray-600'
                      }`}>
                        {userInitial}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {userName}
                          {(member.userId === user?.id || member.id === user?.id) && (
                            <span className="text-xs text-gray-300 ml-1">(you)</span>
                          )}
                          {isMemberOwner && (
                            <span className="text-xs text-yellow-400 flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              Owner
                            </span>
                          )}
                          {isMemberAdmin && !isMemberOwner && (
                            <span className="text-xs text-blue-400 flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                          {!isMemberOwner && !isMemberAdmin && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Member
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">{userEmail}</div>
                      </div>
                      {selectedMembers.includes(member.id) && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </button>
                    
                    {canManage && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.role === 'MEMBER' && (
                          <>
                            {isOwner && (
                              <button
                                onClick={() => handleUpdateRole(member.id, 'ADMIN')}
                                disabled={updatingRole === member.id}
                                className="p-1 hover:bg-blue-500/20 rounded transition-colors disabled:opacity-50"
                                title="Promote to Admin"
                              >
                                {updatingRole === member.id ? (
                                  <LoadingSpinner size="h-3 w-3" className="text-blue-400" />
                                ) : (
                                  <UserPlus className="h-3 w-3 text-blue-400" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                        
                        {member.role === 'ADMIN' && (
                          <button
                            onClick={() => handleUpdateRole(member.id, 'MEMBER')}
                            disabled={updatingRole === member.id}
                            className="p-1 hover:bg-gray-500/20 rounded transition-colors disabled:opacity-50"
                            title="Demote to Member"
                          >
                            {updatingRole === member.id ? (
                              <LoadingSpinner size="h-3 w-3" className="text-gray-400" />
                            ) : (
                              <UserMinus className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                        )}
                        
                        {/* Only show remove button if it's not the current user */}
                        {member.userId !== user?.id && member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Remove Member"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {searchResults.length > 0 && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-gray-300 text-sm mb-2">Add Members:</p>
                  {searchResults.map((user) => {
                    const userName = user.name || 'Unknown User'
                    const userEmail = user.email || ''
                    const userInitial = userName.charAt(0).toUpperCase()
                    
                    return (
                      <div key={user.id} className="flex items-center gap-3 group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-all duration-200">
                            {userInitial}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{userName}</div>
                            <div className="text-gray-400 text-xs">{userEmail}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          className="p-1 hover:bg-green-500/20 rounded transition-colors"
                          title="Add Member"
                        >
                          <Plus className="h-4 w-4 text-green-400" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {searching && (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="h-4 w-4" className="text-gray-400" />
                  <span className="text-gray-400 text-sm">Searching...</span>
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
