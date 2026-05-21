import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Heart, CreditCard, Bell, HelpCircle, Info, ChevronRight, LogOut, User } from 'lucide-react'
import Header from '../components/Header'
import './ProfilePage.css'

function ProfilePage({ user, onLogout }) {
  const navigate = useNavigate()

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => {} },
    { icon: Heart, label: 'Favorites', action: () => {} },
    { icon: CreditCard, label: 'Payment Methods', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: Info, label: 'About', action: () => {} },
  ]

  if (!user) {
    return (
      <div className="profile-page">
        <Header title="Profile" />
        <div className="profile-page__empty">
          <User size={48} className="profile-page__empty-icon" />
          <h2>Sign in to view your profile</h2>
          <p>Log in to manage your bookings, favorites, and settings.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Header title="Profile" />
      
      <div className="profile-page__header">
        <div className="avatar avatar--xl avatar--ring">
          <span className="avatar__initials">{user.name.charAt(0)}</span>
        </div>
        <h2 className="profile-page__name">{user.name}</h2>
        <p className="profile-page__email">{user.email}</p>
        
        <div className="profile-page__stats">
          <div className="profile-page__stat">
            <span className="profile-page__stat-value">12</span>
            <span className="profile-page__stat-label">Bookings</span>
          </div>
          <div className="profile-page__stat-divider" />
          <div className="profile-page__stat">
            <span className="profile-page__stat-value">5</span>
            <span className="profile-page__stat-label">Favorites</span>
          </div>
        </div>
      </div>

      <div className="profile-page__menu">
        {menuItems.map((item, index) => (
          <button key={index} className="profile-page__menu-item" onClick={item.action}>
            <div className="profile-page__menu-icon">
              <item.icon size={20} />
            </div>
            <span className="profile-page__menu-label">{item.label}</span>
            <ChevronRight size={16} className="profile-page__menu-arrow" />
          </button>
        ))}
        
        <button className="profile-page__menu-item profile-page__menu-item--danger" onClick={onLogout}>
          <div className="profile-page__menu-icon">
            <LogOut size={20} />
          </div>
          <span className="profile-page__menu-label">Log Out</span>
        </button>
      </div>

      <div className="profile-page__footer">
        <p>TrainersApp v1.0.0</p>
      </div>
    </div>
  )
}

export default ProfilePage
