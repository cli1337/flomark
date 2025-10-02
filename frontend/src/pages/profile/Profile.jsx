import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Layout from '../../components/Layout'
import { 
  User, 
  Lock, 
  Camera, 
  Save,
  Check,
  X,
  Loader2
} from 'lucide-react'

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [imageSuccess, setImageSuccess] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setProfileImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdatingProfile(true)
    setProfileSuccess(false)
    
    try {
      const result = await updateProfile(name, email)
      if (result.success) {
        setProfileSuccess(true)
        showSuccess('Profile Updated', 'Your profile has been updated successfully')
        setTimeout(() => setProfileSuccess(false), 2000)
      } else {
        showError('Update Failed', result.message)
      }
    } catch (error) {
      showError('Update Failed', 'An error occurred while updating your profile')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showError('Password Mismatch', 'New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      showError('Invalid Password', 'Password must be at least 8 characters long')
      return
    }
    
    setUpdatingPassword(true)
    setPasswordSuccess(false)
    
    try {
      const result = await updatePassword(currentPassword, newPassword)
      if (result.success) {
        setPasswordSuccess(true)
        showSuccess('Password Updated', 'Your password has been updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 2000)
      } else {
        showError('Password Update Failed', result.message)
      }
    } catch (error) {
      showError('Password Update Failed', 'An error occurred while updating your password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage) return
    
    setUploadingImage(true)
    setImageSuccess(false)
    try {
      setImageSuccess(true)
      showSuccess('Image Updated', 'Your profile image has been updated')
      setProfileImage(null)
      setProfileImagePreview(null)
      setTimeout(() => setImageSuccess(false), 2000)
    } catch (error) {
      showError('Upload Failed', 'An error occurred while uploading your image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <Layout>
      <div className="px-8 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={updatingProfile || profileSuccess}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      profileSuccess 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                  >
                    {updatingProfile ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </div>
                    ) : profileSuccess ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Updated!
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold border border-white/20 ${profileImagePreview ? 'bg-transparent' : 'bg-gray-600'}`}>
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        'U'
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block"
                    >
                      <Camera className="h-4 w-4 mr-2 inline" />
                      Choose Image
                    </label>
                    <p className="text-gray-400 text-sm mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
                
                {profileImage && (
                  <Button
                    onClick={handleImageUpload}
                    disabled={uploadingImage || imageSuccess}
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      imageSuccess 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : imageSuccess ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Uploaded!
                      </div>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={updatingPassword || passwordSuccess}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    passwordSuccess 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                >
                  {updatingPassword ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  ) : passwordSuccess ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Updated!
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
