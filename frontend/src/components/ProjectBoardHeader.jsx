import React, { useState } from 'react'
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
  Mail
} from 'lucide-react'
import LabelFilter from './LabelFilter'
import MemberFilter from './MemberFilter'
import InviteModal from './InviteModal'

const ProjectBoardHeader = ({ project, members = [], projectOwner, onInviteMember, onLabelsChange, onMembersChange }) => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  const isOwner = project?.members?.some(member => 
    member.userId === projectOwner?.id && member.role === 'OWNER'
  )

  const handleLabelsChange = (labels) => {
    setSelectedLabels(labels)
    onLabelsChange?.(labels)
  }

  const handleMembersChange = (members) => {
    setSelectedMembers(members)
    onMembersChange?.(members)
  }

  return (
    <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white project-name">{project?.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member, index) => {
                const userName = member.user?.name || member.name || 'Unknown User'
                const userRole = member.role || 'MEMBER'
                const userInitial = userName.charAt(0).toUpperCase()
                const isOwner = member.role === 'OWNER' || member.isOwner
                
                return (
                  <div
                    key={member.id || index}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium border border-white/20 hover:border-white/40 hover:z-10 relative cursor-pointer transition-all duration-200 group ${
                      isOwner ? 'bg-gray-500' : 'bg-gray-600'
                    }`}
                    title={`${userName} - ${userRole}`}
                  >
                    <span>{userInitial}</span>
                    
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
            
            {isOwner && (
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-sm rounded-lg"
              >
                <Mail className="h-4 w-4 mr-1" />
                Invite
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
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
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
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
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Board
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
