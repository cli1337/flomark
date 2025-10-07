import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import usePageTitle from '../../hooks/usePageTitle'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  User, 
  Lock, 
  Camera, 
  Save,
  Check,
  ShieldCheck,
  QrCode,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { authService } from '../../services/authService'

const Profile = () => {
  const { user, updateProfile, updatePassword, uploadProfileImage } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  
  usePageTitle('Profile')
  
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
  const [twoFAInit, setTwoFAInit] = useState(null)
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAEnabling, setTwoFAEnabling] = useState(false)
  const [twoFADisabling, setTwoFADisabling] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      const result = await updateProfile(name)
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
      const result = await uploadProfileImage(profileImage)
      if (result.success) {
        setImageSuccess(true)
        showSuccess('Image Updated', 'Your profile image has been updated')
        setProfileImage(null)
        setProfileImagePreview(null)
        setTimeout(() => setImageSuccess(false), 2000)
      } else {
        showError('Upload Failed', result.message)
      }
    } catch (error) {
      showError('Upload Failed', 'An error occurred while uploading your image')
    } finally {
      setUploadingImage(false)
    }
  }

  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const specialChars = '!@#$%^&*'
    
    let password = ''
    
    // Ensure at least 1 uppercase
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    
    // Ensure at least 1 special character
    password += specialChars[Math.floor(Math.random() * specialChars.length)]
    
    // Ensure at least 1 number
    password += numbers[Math.floor(Math.random() * numbers.length)]
    
    // Fill the rest (make it 12 characters total for good security)
    const allChars = lowercase + uppercase + numbers + specialChars
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password to randomize the position of required characters
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setNewPassword(password)
    setConfirmPassword(password)
    setShowNewPassword(true)
    setShowConfirmPassword(true)
    
    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
      showSuccess('Password Generated & Copied', 'A secure random password has been generated and copied to clipboard!')
    }).catch(() => {
      showSuccess('Password Generated', 'A secure random password has been generated. Make sure to save it!')
    })
  }

  const startTwoFA = async () => {
    try {
      setTwoFAEnabling(true)
      const resp = await authService.init2FA()
      if (resp.success) {
        setTwoFAInit(resp.data)
      } else {
        showError('2FA Setup Failed', resp.message)
      }
    } catch (e) {
      showError('2FA Setup Failed', 'Could not initialize 2FA')
    } finally {
      setTwoFAEnabling(false)
    }
  }

  const confirmTwoFA = async () => {
    if (!twoFACode) return
    try {
      setTwoFAEnabling(true)
      const resp = await authService.verify2FASetup(twoFACode)
      if (resp.success) {
        setTwoFAInit(null)
        setTwoFACode('')
        showSuccess('Two-Factor Enabled', '2FA has been enabled on your account')
      } else {
        showError('Verification Failed', resp.message)
      }
    } catch (e) {
      showError('Verification Failed', 'Invalid or expired code')
    } finally {
      setTwoFAEnabling(false)
    }
  }

  const disableTwoFA = async () => {
    try {
      setTwoFADisabling(true)
      const code = twoFACode || undefined
      const resp = await authService.disable2FA(code)
      if (resp.success) {
        setTwoFAInit(null)
        setTwoFACode('')
        showSuccess('Two-Factor Disabled', '2FA has been disabled on your account')
      } else {
        showError('Disable Failed', resp.message)
      }
    } catch (e) {
      showError('Disable Failed', 'Could not disable 2FA')
    } finally {
      setTwoFADisabling(false)
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
                      disabled
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
                        <LoadingSpinner size="h-4 w-4" />
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
                    <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold border border-white/20 ${(profileImagePreview || user?.profileImage) ? 'bg-transparent' : 'bg-gray-600'}`}>
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : user?.profileImage ? (
                        <img
                          src={`/api/storage/photos/${user.profileImage}`}
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
                        <LoadingSpinner size="h-4 w-4" />
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md transition-all"
                    >
                      <Sparkles className="h-3 w-3" />
                      Generate Random
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                      <LoadingSpinner size="h-4 w-4" />
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

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Two-Factor Authentication (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user?.twoFactorEnabled && !twoFAInit && (
                <Button onClick={startTwoFA} disabled={twoFAEnabling} className="w-full bg-white text-black">
                  {twoFAEnabling ? 'Starting…' : 'Enable 2FA'}
                </Button>
              )}

              {twoFAInit && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    {twoFAInit.qrDataUrl ? (
                      <img src={twoFAInit.qrDataUrl} alt="QR Code" className="w-48 h-48 bg-white p-2 rounded" />
                    ) : (
                      <QrCode className="w-48 h-48 text-white" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm text-center">
                    Scan this QR code with your authenticator app and enter the 6-digit code.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={confirmTwoFA} disabled={twoFAEnabling} className="bg-white text-black">
                      {twoFAEnabling ? 'Verifying…' : 'Verify & Enable'}
                    </Button>
                    <Button onClick={() => setTwoFAInit(null)} className="bg-white/10 text-white">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {user?.twoFactorEnabled && !twoFAInit && (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    2FA is currently enabled on your account.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value)}
                      placeholder="Enter 6-digit code to disable"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    />
                    <Button onClick={disableTwoFA} disabled={twoFADisabling} className="bg-white/10 text-white">
                      {twoFADisabling ? 'Disabling…' : 'Disable 2FA'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
