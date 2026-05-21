import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      const res = await authAPI.login({ email, password })
      onLogin(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="login">
      <div className="login__brand">
        <h1 className="login__logo">Trainers<span className="login__logo-accent">App</span></h1>
        <p className="login__subtitle">Log in to continue your fitness journey.</p>
      </div>

      <div className="login__card card">
        {error && <div className="login__error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__field">
            <input 
              type="email" 
              className="login__input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label className="login__label">Email</label>
          </div>
          
          <div className="login__field">
            <input 
              type="password" 
              className="login__input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <label className="login__label">Password</label>
          </div>
          
          <div className="login__submit">
            <button type="submit" className="btn btn--primary btn--block">Log In</button>
          </div>
        </form>
        
        <div className="login__footer">
          <span className="login__footer-text">Don't have an account? </span>
          <Link to="/register" className="login__footer-link">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
