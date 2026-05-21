import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import Header from '../components/Header'
import BookingCard from '../components/BookingCard'
import { useNavigate } from 'react-router-dom'
import './BookingsPage.css'

function BookingsPage({ user }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('trainersapp_bookings')
    if (stored) {
      setBookings(JSON.parse(stored))
    }
  }, [])

  if (!user) {
    return (
      <div className="bookings-page">
        <Header title="My Bookings" />
        <div className="bookings-page__empty">
          <Calendar size={48} className="bookings-page__empty-icon" />
          <h2>Log in to view bookings</h2>
          <p>You need to be logged in to see your scheduled sessions.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    )
  }

  const filteredBookings = bookings.filter(b => b.status === activeTab)

  return (
    <div className="bookings-page">
      <Header title="My Bookings" />
      
      <div className="bookings-page__tabs">
        <button 
          className={`bookings-page__tab ${activeTab === 'upcoming' ? 'bookings-page__tab--active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`bookings-page__tab ${activeTab === 'completed' ? 'bookings-page__tab--active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`bookings-page__tab ${activeTab === 'cancelled' ? 'bookings-page__tab--active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div className="bookings-page__list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="bookings-page__empty">
            <Calendar size={48} className="bookings-page__empty-icon" />
            <h2>No {activeTab} bookings</h2>
            <p>You don't have any {activeTab} sessions right now.</p>
            {activeTab === 'upcoming' && (
              <button className="btn btn--primary" onClick={() => navigate('/search')}>Browse Trainers</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingsPage
