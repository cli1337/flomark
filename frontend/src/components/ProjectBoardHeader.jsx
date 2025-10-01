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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{project?.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, index) => (
                <div
                  key={member.id || index}
                  className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-[#18191b] hover:z-10 relative cursor-pointer"
                  title={member.user?.name || member.name || 'Unknown User'}
                >
                  {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 
                   member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </div>
              ))}
              {members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium border-2 border-[#18191b]">
                  +{members.length - 5}
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
