import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { getUserAvatarUrl } from '../utils/avatarUtils.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { FaUser, FaShieldAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import './AccountModal.css'

export default function AccountModal({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '')
  const [isAddingPhone, setIsAddingPhone] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const fileInputRef = useRef(null)
  const phoneInputRef = useRef(null)

  // Initialize state when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '')
      setPhoneNumber(user.phone || '')
      setAvatarUrl(null)
    }
  }, [user])

  if (!isOpen || !user) return null

  const currentAvatarUrl = avatarUrl || getUserAvatarUrl(user)

  const handleUpdateProfile = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase is not configured')
      }

      // Create a file path for the avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage (assuming you have an 'avatars' bucket)
      // If storage is not set up, we'll use user metadata instead
      let imageUrl = null
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        imageUrl = urlData.publicUrl
      } catch (storageError) {
        // If storage fails, convert to base64 and store in metadata
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = reader.result
          await updateUserMetadata({ avatar_url: base64String })
        }
        reader.readAsDataURL(file)
        setIsUploadingImage(false)
        return
      }

      // Update user metadata with avatar URL
      await updateUserMetadata({ avatar_url: imageUrl })
      setAvatarUrl(imageUrl)
      
      alert('Profile picture updated successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const updateUserMetadata = async (metadata) => {
    if (!isSupabaseConfigured() || !supabase) return

    try {
      // Get current user to merge with existing metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('User not found')
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          ...metadata
        }
      })

      if (error) throw error

      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error('Error updating user metadata:', error)
      throw error
    }
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      alert('Display name cannot be empty')
      return
    }

    try {
      await updateUserMetadata({ name: displayName.trim() })
      setIsEditingName(false)
      alert('Display name updated successfully!')
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Failed to update display name. Please try again.')
    }
  }

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number')
      return
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    if (!phoneRegex.test(phoneNumber.trim())) {
      alert('Please enter a valid phone number')
      return
    }

    try {
      await updateUserMetadata({ phone: phoneNumber.trim() })
      setIsAddingPhone(false)
      alert('Phone number added successfully!')
    } catch (error) {
      console.error('Error adding phone:', error)
      alert('Failed to add phone number. Please try again.')
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setIsChangingPassword(true)
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase is not configured')
      }

      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) throw updateError

      alert('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    onClose()
    navigate('/')
  }

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left Navigation Pane */}
        <div className="account-modal-nav">
          <div className="account-modal-nav-header">
            <h2 className="account-modal-nav-title">Account</h2>
            <p className="account-modal-nav-subtitle">Manage your account info.</p>
          </div>
          <nav className="account-modal-nav-links">
            <button
              className={`account-modal-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className="account-modal-nav-icon" />
              <span>Profile</span>
            </button>
            <button
              className={`account-modal-nav-link ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FaShieldAlt className="account-modal-nav-icon" />
              <span>Security</span>
            </button>
          </nav>
        </div>

        {/* Right Content Pane */}
        <div className="account-modal-content">
          <div className="account-modal-content-header">
            <h2 className="account-modal-content-title">
              {activeTab === 'profile' ? 'Profile details' : 'Security settings'}
            </h2>
            <button className="account-modal-close" onClick={onClose}>
              <IoClose />
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="account-modal-profile-content">
              {/* Profile Section */}
              <div className="account-modal-section">
                <h3 className="account-modal-section-title">Profile</h3>
                <div className="account-modal-profile-info">
                  <div className="account-modal-avatar-container">
                    <img
                      src={currentAvatarUrl}
                      alt={user.name || user.email}
                      className="account-modal-avatar"
                      onError={(e) => {
                        e.target.src = '/male.png'
                      }}
                    />
                    {isUploadingImage && (
                      <div className="account-modal-avatar-loading">Uploading...</div>
                    )}
                  </div>
                  <div className="account-modal-profile-text">
                    {isEditingName ? (
                      <div className="account-modal-name-edit">
                        <input
                          type="text"
                          className="account-modal-name-input"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter display name"
                          autoFocus
                        />
                        <div className="account-modal-name-actions">
                          <button 
                            className="account-modal-name-save"
                            onClick={handleSaveName}
                          >
                            Save
                          </button>
                          <button 
                            className="account-modal-name-cancel"
                            onClick={() => {
                              setIsEditingName(false)
                              setDisplayName(user.name || '')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="account-modal-name-display">
                        <div className="account-modal-profile-name">
                          {user.name || 'User'}
                        </div>
                        <button 
                          className="account-modal-edit-name-btn"
                          onClick={() => setIsEditingName(true)}
                        >
                          Edit name
                        </button>
                      </div>
                    )}
                    <button 
                      className="account-modal-update-btn"
                      onClick={handleUpdateProfile}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? 'Uploading...' : 'Update profile'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Email Addresses Section */}
              <div className="account-modal-section">
                <h3 className="account-modal-section-title">Email addresses</h3>
                <div className="account-modal-email-list">
                  <div className="account-modal-email-item">
                    <span className="account-modal-email-address">{user.email}</span>
                    <span className="account-modal-email-badge">Primary</span>
                  </div>
                </div>
              </div>

              {/* Phone Numbers Section */}
              <div className="account-modal-section">
                <h3 className="account-modal-section-title">Phone numbers</h3>
                <div className="account-modal-phone-list">
                  {phoneNumber ? (
                    <div className="account-modal-phone-item">
                      <span className="account-modal-phone-number">{phoneNumber}</span>
                      <button 
                        className="account-modal-edit-phone-btn"
                        onClick={() => setIsAddingPhone(true)}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <>
                      {isAddingPhone ? (
                        <div className="account-modal-phone-input-container">
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            className="account-modal-phone-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            autoFocus
                          />
                          <div className="account-modal-phone-actions">
                            <button 
                              className="account-modal-phone-save"
                              onClick={handleAddPhone}
                            >
                              Save
                            </button>
                            <button 
                              className="account-modal-phone-cancel"
                              onClick={() => {
                                setIsAddingPhone(false)
                                setPhoneNumber(user.phone || '')
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="account-modal-add-link"
                          onClick={() => setIsAddingPhone(true)}
                        >
                          + Add phone number
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <div className="account-modal-section">
                <button 
                  className="account-modal-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="account-modal-security-content">
              <div className="account-modal-section">
                <h3 className="account-modal-section-title">Password</h3>
                <p className="account-modal-section-description">
                  Change your password to keep your account secure.
                </p>
                {isChangingPassword ? (
                  <div className="account-modal-password-form">
                    <div className="account-modal-form-group">
                      <label className="account-modal-form-label">Current Password</label>
                      <input
                        type="password"
                        className="account-modal-form-input"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="account-modal-form-group">
                      <label className="account-modal-form-label">New Password</label>
                      <input
                        type="password"
                        className="account-modal-form-input"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="account-modal-form-group">
                      <label className="account-modal-form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="account-modal-form-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="account-modal-password-actions">
                      <button 
                        className="account-modal-action-btn"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Changing...' : 'Save Password'}
                      </button>
                      <button 
                        className="account-modal-cancel-btn"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="account-modal-action-btn"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change password
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

