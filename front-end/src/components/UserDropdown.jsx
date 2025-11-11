import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { getUserAvatarUrl } from '../utils/avatarUtils.js'
import './UserDropdown.css'

export default function UserDropdown() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await signOut()
    setIsOpen(false)
    navigate('/')
  }

  const handleProfileClick = () => {
    setIsOpen(false)
    navigate('/profile')
  }

  if (!user) return null

  const avatarUrl = getUserAvatarUrl(user)

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={user.name || user.email}
      >
        <img 
          src={avatarUrl} 
          alt={user.name || user.email} 
          className="user-avatar"
          onError={(e) => {
            e.target.src = '/male.png' // Fallback to default avatar
          }}
        />
      </button>
      
      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <img 
              src={avatarUrl} 
              alt={user.name || user.email} 
              className="user-dropdown-avatar"
              onError={(e) => {
                e.target.src = '/male.png'
              }}
            />
            <div className="user-dropdown-info">
              <div className="user-dropdown-name">{user.name || 'User'}</div>
              <div className="user-dropdown-email">{user.email}</div>
            </div>
          </div>
          <div className="user-dropdown-divider"></div>
          <button 
            className="user-dropdown-item"
            onClick={handleProfileClick}
          >
            <span>Profile</span>
          </button>
          <button 
            className="user-dropdown-item user-dropdown-item-danger"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

