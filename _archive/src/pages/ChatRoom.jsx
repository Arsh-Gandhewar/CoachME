import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import { trainers } from '../data/trainers'
import './ChatRoom.css'

function ChatRoom({ user }) {
  const { trainerId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const trainer = trainers.find(t => t.id === parseInt(trainerId))

  useEffect(() => {
    // Initial mock messages
    setMessages([
      { id: 1, text: "Hi! How can I help you with your fitness goals?", sender: 'trainer', time: '10:00 AM' }
    ])
  }, [trainerId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!trainer) {
    return <div>Trainer not found</div>
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsTyping(true)

    // Simulate auto-reply
    setTimeout(() => {
      setIsTyping(false)
      const reply = {
        id: Date.now() + 1,
        text: "That sounds great! I'd love to help you with that. Are you looking for personal training or group sessions?",
        sender: 'trainer',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, reply])
    }, 1500)
  }

  return (
    <div className="chat-room">
      <div className="chat-room__header">
        <button className="btn btn--icon btn--ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="avatar avatar--sm">
          <span className="avatar__initials">{trainer.name.charAt(0)}</span>
        </div>
        <div className="chat-room__header-info">
          <h2 className="chat-room__name">{trainer.name}</h2>
          <span className="chat-room__status">Online</span>
        </div>
      </div>

      <div className="chat-room__messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-room__message-wrapper ${msg.sender === 'user' ? 'chat-room__message-wrapper--self' : ''}`}>
            <div className={`chat-room__message ${msg.sender === 'user' ? 'chat-room__message--self' : 'chat-room__message--other'}`}>
              <p>{msg.text}</p>
              <span className="chat-room__message-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-room__message-wrapper">
            <div className="chat-room__message chat-room__message--other chat-room__typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-room__input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="chat-room__input form-input" 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn--primary btn--icon chat-room__send-btn" disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatRoom
