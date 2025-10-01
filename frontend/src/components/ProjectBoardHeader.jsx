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
  Plus
} from 'lucide-react'
import LabelFilter from './LabelFilter'
import MemberFilter from './MemberFilter'

const ProjectBoardHeader = ({ project, members = [], projectOwner, onInviteMember, onLabelsChange, onMembersChange }) => {
  const [showInviteDropdown, setShowInviteDropdown] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  const generateInviteUrl = () => {
    const inviteCode = Math.random().toString(36).substring(2, 15)
    const url = `${window.location.origin}/projects/${project.id}/join?code=${inviteCode}`
    setInviteUrl(url)
    setShowInviteDropdown(true)
  }

  const copyInviteUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

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
            
            <Button
              onClick={generateInviteUrl}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-sm rounded-lg"
            >
              <Plus className="h-4 w-4 mr-1" />
              Invite
            </Button>
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

      {showInviteDropdown && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium mb-1">Invite Members</h3>
              <p className="text-gray-400 text-sm mb-2">Share this link to invite team members</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
                <Button
                  onClick={copyInviteUrl}
                  className="bg-white hover:bg-gray-100 text-black px-3 py-2 text-sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setShowInviteDropdown(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectBoardHeader
