import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Settings } from 'lucide-react'
import Layout from '../../components/Layout'
import UsersList from './UsersList'

const AdminPanel = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')

  return (
    <Layout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col">
          {/* Back to User Panel Button */}
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-4 py-3 m-4 hover:bg-white/10 rounded-lg transition-colors text-white border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to User Panel</span>
          </button>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Users</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* Admin Badge */}
          <div className="p-4 border-t border-white/10">
            <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
              <p className="text-purple-400 text-sm font-medium text-center">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'settings' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AdminPanel

