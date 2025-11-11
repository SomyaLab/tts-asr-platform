import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { getUserAvatarUrl } from '../utils/avatarUtils.js'
import './UserProfile.css'

export default function UserProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const avatarUrl = getUserAvatarUrl(user)

  // Format account creation date if available
  const accountDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'N/A'

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <div className="user-profile-header">
          <div className="user-profile-avatar-section">
            <img 
              src={avatarUrl} 
              alt={user.name || user.email} 
              className="user-profile-avatar"
              onError={(e) => {
                e.target.src = '/male.png'
              }}
            />
            <h1 className="user-profile-name">{user.name || 'User'}</h1>
            <p className="user-profile-email">{user.email}</p>
          </div>
        </div>

        <div className="user-profile-content">
          <div className="user-profile-section">
            <h2 className="user-profile-section-title">Account Information</h2>
            <div className="user-profile-info-grid">
              <div className="user-profile-info-item">
                <label className="user-profile-info-label">Display Name</label>
                <div className="user-profile-info-value">{user.name || 'Not set'}</div>
              </div>
              <div className="user-profile-info-item">
                <label className="user-profile-info-label">Email Address</label>
                <div className="user-profile-info-value">{user.email}</div>
              </div>
              <div className="user-profile-info-item">
                <label className="user-profile-info-label">Account ID</label>
                <div className="user-profile-info-value user-profile-id">{user.id || 'N/A'}</div>
              </div>
              <div className="user-profile-info-item">
                <label className="user-profile-info-label">Account Created</label>
                <div className="user-profile-info-value">{accountDate}</div>
              </div>
              <div className="user-profile-info-item">
                <label className="user-profile-info-label">Authentication Provider</label>
                <div className="user-profile-info-value">
                  {user.provider === 'password' ? 'Email/Password' : user.provider || 'Email/Password'}
                </div>
              </div>
            </div>
          </div>

          <div className="user-profile-section">
            <h2 className="user-profile-section-title">Settings</h2>
            <div className="user-profile-settings">
              <button className="user-profile-setting-btn" disabled>
                Change Password
              </button>
              <button className="user-profile-setting-btn" disabled>
                Update Profile
              </button>
              <button className="user-profile-setting-btn" disabled>
                Privacy Settings
              </button>
            </div>
            <p className="user-profile-note">
              Additional settings coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

