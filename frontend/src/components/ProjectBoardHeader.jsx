import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { Button } from './ui/Button'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { 
  Users, 
  Filter, 
  Search, 
  Copy, 
  Share2,
  MoreVertical,
  Plus,
  Mail,
  X,
  Workflow
} from 'lucide-react'
import LabelFilter from './LabelFilter'
import MemberFilter from './MemberFilter'
import InviteModal from './InviteModal'
import ActivityIndicator from './ActivityIndicator'

const ProjectBoardHeader = ({ project, members = [], projectOwner, onInviteMember, onLabelsChange, onMembersChange, onLabelsUpdated, onSearchChange }) => {
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const { isConnected } = useSocket()

  const currentUserMember = project?.members?.find(member => member.userId === projectOwner?.id)
  const isOwner = currentUserMember?.role === 'OWNER'
  const isAdmin = currentUserMember?.role === 'ADMIN'
  const canManageProject = isOwner || isAdmin

  const handleLabelsChange = (labels) => {
    setSelectedLabels(labels)
    onLabelsChange?.(labels)
  }

  const handleMembersChange = (members) => {
    setSelectedMembers(members)
    onMembersChange?.(members)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  return (
    <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-white project-name select-none truncate">{project?.name}</h1>
          <ActivityIndicator projectId={project?.id} />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member, index) => {
                const userName = member.user?.name || member.name || 'Unknown User'
                const userRole = member.role || 'MEMBER'
                const userInitial = userName.charAt(0).toUpperCase()
                const isOwner = member.role === 'OWNER' || member.isOwner
                
                return (
                  <div
                    key={member.id || index}
                    className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-medium border border-white/20 hover:border-white/40 hover:z-10 relative cursor-pointer transition-all duration-200 group ${
                      isOwner ? 'bg-gray-500' : 'bg-gray-600'
                    }`}
                    title={`${userName} - ${userRole}`}
                  >
                    {member.user?.profileImage ? (
                      <img 
                        src={`/api/storage/photos/${member.user.profileImage}`} 
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                    
                    {/* Enhanced tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-xl">
                      <div className="font-medium text-white">{userName}</div>
                      <div className="text-gray-400 text-xs">{userRole}</div>
                      {/* Tooltip arrow */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white/5"></div>
                    </div>
                  </div>
                )
              })}
              {members.length > 3 && (
                <div 
                  className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-white text-xs font-medium border border-white/20 hover:border-white/40 cursor-pointer transition-all duration-200 group"
                  title={`${members.length - 3} more members`}
                >
                  +{members.length - 3}
                  
                  {/* Tooltip for more members */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-xl max-w-xs">
                    <div className="font-medium text-white">{members.length - 3} more members</div>
                    <div className="text-gray-400 text-xs">
                      {members.slice(3).map(m => m.user?.name || m.name || 'Unknown').join(', ')}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white/5"></div>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={() => navigate(`/projects/${project?.id}/flow`)}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 px-2 sm:px-3 py-1 text-sm rounded-lg"
              title="Flow View"
            >
              <Workflow className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Flow View</span>
            </Button>
            
            {canManageProject && (
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-3 py-1 text-sm rounded-lg"
              >
                <Mail className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <MemberFilter
              projectId={project?.id}
              projectOwner={projectOwner}
              selectedMembers={selectedMembers}
              onMembersChange={handleMembersChange}
            />

            <LabelFilter
              projectId={project?.id}
              selectedLabels={selectedLabels}
              onLabelsChange={handleLabelsChange}
              onLabelsUpdated={onLabelsUpdated}
            />

            {/* Clear Filters Button */}
            {(selectedLabels.length > 0 || selectedMembers.length > 0 || searchQuery) && (
              <Button
                onClick={() => {
                  setSelectedLabels([])
                  setSelectedMembers([])
                  setSearchQuery('')
                  onLabelsChange?.([])
                  onMembersChange?.([])
                  onSearchChange?.('')
                }}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Clear Filters</span>
              </Button>
            )}
          </div>

          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={project?.id}
        projectName={project?.name}
      />
    </div>
  )
}

export default ProjectBoardHeader
