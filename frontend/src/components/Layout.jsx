import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { 
  User,
  Settings,
  LogOut,
  MoreVertical,
  ArrowLeft
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  const isProjectDetail = location.pathname.includes('/projects/') && location.pathname !== '/projects'
  const isProfilePage = location.pathname === '/profile'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative flex h-screen flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(isProjectDetail || isProfilePage) && (
              <button
                onClick={() => {
                  if (isProfilePage) {
                    const state = location.state
                    const backUrl = state?.from || '/projects'
                    navigate(backUrl)
                  } else {
                    navigate('/projects')
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">
                  {isProfilePage ? 'Back' : 'Back to Projects'}
                </span>
              </button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors group">
                <div className="h-8 w-8 rounded-lg bg-gray-600 flex items-center justify-center text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-all duration-200">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/profile', { state: { from: location.pathname } })}
                >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
