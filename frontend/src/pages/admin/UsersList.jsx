import React, { useState, useEffect, useMemo } from 'react'
import { Edit, Shield, ShieldOff, Loader2, Crown, Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import EditUserModal from '../../components/EditUserModal'
import CreateUserModal from '../../components/CreateUserModal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllUsers()
      if (response.success) {
        setUsers(response.data)
      } else {
        showToast('Failed to load users', 'error')
      }
    } catch (error) {
      showToast(error.data?.message || 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handlePromoteUser = async (user) => {
    try {
      const response = await adminService.promoteUser(user.id)
      if (response.success) {
        showToast(
          `User ${user.role === 'ADMIN' ? 'demoted to USER' : 'promoted to ADMIN'}`,
          'success'
        )
        loadUsers()
      } else {
        showToast('Failed to update user role', 'error')
      }
    } catch (error) {
      showToast(error.data?.message || 'Failed to update user role', 'error')
    }
  }

  const handleUserUpdated = () => {
    loadUsers()
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const canEditUser = (targetUser) => {
    // Cannot edit yourself
    if (targetUser.id === currentUser.id) return false
    
    // OWNER cannot edit other OWNERs
    if (targetUser.role === 'OWNER') return false
    
    // ADMIN can only edit USERs
    if (currentUser.role === 'ADMIN' && (targetUser.role === 'ADMIN' || targetUser.role === 'OWNER')) {
      return false
    }
    
    return true
  }

  const canPromoteUser = (targetUser) => {
    // Cannot promote yourself
    if (targetUser.id === currentUser.id) return false
    
    // Cannot modify OWNER role
    if (targetUser.role === 'OWNER') return false
    
    // ADMIN can only promote/demote USERs
    if (currentUser.role === 'ADMIN' && targetUser.role === 'ADMIN') {
      return false
    }
    
    return true
  }

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = [...users]

    // Search by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [users, searchQuery, roleFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.slice(start, end)
  }, [filteredUsers, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-100"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white/10 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="ALL" className="bg-[#1a1b1e]">All Roles</option>
            <option value="OWNER" className="bg-[#1a1b1e]">Owner</option>
            <option value="ADMIN" className="bg-[#1a1b1e]">Admin</option>
            <option value="USER" className="bg-[#1a1b1e]">User</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-white/10 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="createdAt" className="bg-[#1a1b1e]">Join Date</option>
            <option value="name" className="bg-[#1a1b1e]">Name</option>
            <option value="email" className="bg-[#1a1b1e]">Email</option>
            <option value="role" className="bg-[#1a1b1e]">Role</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-400">
          Showing {paginatedUsers.length} of {filteredUsers.length} users
          {searchQuery && ` (filtered from ${users.length} total)`}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  2FA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-semibold border border-white/20">
                        {user.profileImage ? (
                          <img
                            src={`/api/storage/photos/${user.profileImage}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-600 flex items-center justify-center text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      user.role === 'OWNER' ? 'warning' : 
                      user.role === 'ADMIN' ? 'destructive' : 
                      'secondary'
                    }>
                      {user.role === 'OWNER' && <Crown className="h-3 w-3 mr-1 inline" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.twoFactorEnabled ? 'success' : 'secondary'}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canEditUser(user) ? (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-2 text-gray-600 cursor-not-allowed rounded-lg"
                          title={user.role === 'OWNER' ? 'Cannot edit owner' : 'Cannot edit this user'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canPromoteUser(user) ? (
                        <button
                          onClick={() => handlePromoteUser(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.role === 'ADMIN'
                              ? 'text-orange-400 hover:bg-orange-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={user.role === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN'}
                        >
                          {user.role === 'ADMIN' ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-2 text-gray-600 cursor-not-allowed rounded-lg"
                          title={user.role === 'OWNER' ? 'Cannot modify owner role' : 'Cannot modify this user'}
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={() => {
            loadUsers()
            setIsCreateModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default UsersList

