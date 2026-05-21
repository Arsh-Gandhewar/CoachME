import React, { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'
import { trainers } from '../data/trainers'
import './ChatPage.css'

function ChatPage({ user }) {
  const navigate = useNavigate()
  const [chats, setChats] = useState([])

  useEffect(() => {
    // Generate some mock chats based on the trainers data
    const mockChats = [
      { id: 1, trainerId: 1, lastMessage: "See you tomorrow at 6 AM!", time: "10:30 AM", unread: 0 },
      { id: 2, trainerId: 2, lastMessage: "Yes, please bring your own yoga mat.", time: "Yesterday", unread: 2 },
    ]
    setChats(mockChats)
  }, [])

  if (!user) {
    return (
      <div className="chat-page">
        <Header title="Messages" />
        <div className="chat-page__empty">
          <MessageCircle size={48} className="chat-page__empty-icon" />
          <h2>Log in to view messages</h2>
          <p>You need to be logged in to chat with trainers.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <Header title="Messages" />
      
      <div className="chat-page__list">
        {chats.length > 0 ? (
          chats.map(chat => {
            const trainer = trainers.find(t => t.id === chat.trainerId)
            if (!trainer) return null;
            return (
              <div 
                key={chat.id} 
                className="chat-page__item card"
                onClick={() => navigate(`/chat/${trainer.id}`)}
              >
                <div className="avatar avatar--md">
                  <span className="avatar__initials">{trainer.name.charAt(0)}</span>
                </div>
                <div className="chat-page__item-content">
                  <div className="chat-page__item-header">
                    <h3 className="chat-page__item-name">{trainer.name}</h3>
                    <span className="chat-page__item-time">{chat.time}</span>
                  </div>
                  <div className="chat-page__item-footer">
                    <p className={`chat-page__item-message ${chat.unread > 0 ? 'chat-page__item-message--unread' : ''}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="chat-page__item-badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="chat-page__empty">
            <MessageCircle size={48} className="chat-page__empty-icon" />
            <h2>No messages yet</h2>
            <p>Your conversations with trainers will appear here.</p>
            <button className="btn btn--primary" onClick={() => navigate('/search')}>Find a Trainer</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
