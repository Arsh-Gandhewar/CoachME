import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { categories } from '../data/trainers'
import { authAPI } from '../services/api'
import './RegisterPage.css'

function RegisterPage({ onLogin }) {
  const navigate = useNavigate()
  const [role, setRole] = useState('user') // 'user' or 'trainer'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    category: categories[0]?.id || '',
    experience: '',
    pricing: '',
    location: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (role === 'trainer' && (!formData.category || !formData.experience || !formData.pricing)) {
      setError('Please fill in all trainer details.')
      return
    }

    try {
      const payload = { ...formData, role }
      const res = await authAPI.register(payload)
      onLogin(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="register">
      <div className="register__brand">
        <h1 className="register__logo">Trainers<span className="register__logo-accent">App</span></h1>
        <p className="register__subtitle">Join to start your fitness journey.</p>
      </div>
      
      <div className="register__card card">
        <div className="register__role-toggle">
          <button 
            className={`register__role-btn ${role === 'user' ? 'register__role-btn--active' : ''}`}
            onClick={() => setRole('user')}
          >
            User
          </button>
          <button 
            className={`register__role-btn ${role === 'trainer' ? 'register__role-btn--active' : ''}`}
            onClick={() => setRole('trainer')}
          >
            Trainer
          </button>
        </div>
        
        {error && <div className="register__error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register__form">
          <div className="register__field">
            <input type="text" className="register__input" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
            <label className="register__label">Full Name *</label>
          </div>
          
          <div className="register__field">
            <input type="email" className="register__input" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            <label className="register__label">Email *</label>
          </div>
          
          <div className="register__field">
            <input type="tel" className="register__input" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 0000000000" />
            <label className="register__label">Phone</label>
          </div>
          
          <div className="register__field">
            <input type="password" className="register__input" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            <label className="register__label">Password *</label>
          </div>
          
          {role === 'trainer' && (
            <div className="register__trainer-fields">
              <div className="register__divider">Trainer Details</div>
              
              <div className="register__field">
                <select className="register__select" name="category" value={formData.category} onChange={handleChange}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <label className="register__label">Category *</label>
              </div>
              
              <div className="register__row">
                <div className="register__field">
                  <input type="number" className="register__input" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5" />
                  <label className="register__label">Experience (Years) *</label>
                </div>
                
                <div className="register__field">
                  <input type="number" className="register__input" name="pricing" value={formData.pricing} onChange={handleChange} placeholder="e.g. 1000" />
                  <label className="register__label">Pricing (₹/session) *</label>
                </div>
              </div>
              
              <div className="register__field">
                <input type="text" className="register__input" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Andheri West, Mumbai" />
                <label className="register__label">Location</label>
              </div>
            </div>
          )}
          
          <div className="register__submit">
            <button type="submit" className="btn btn--primary btn--block">Create Account</button>
          </div>
        </form>
        
        <div className="register__footer">
          <span className="register__footer-text">Already have an account? </span>
          <Link to="/login" className="register__footer-link">Log in</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
