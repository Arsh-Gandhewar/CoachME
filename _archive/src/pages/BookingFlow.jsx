import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react'
import { trainers } from '../data/trainers'
import Header from '../components/Header'
import './BookingFlow.css'

function BookingFlow({ user }) {
  const { trainerId } = useParams()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: Type, 2: Date/Time, 3: Confirm
  const [sessionType, setSessionType] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  
  const trainer = trainers.find(t => t.id === parseInt(trainerId))

  if (!trainer) return <div>Trainer not found</div>
  
  if (!user) {
    // If not logged in, should redirect to login but for preview we will show an error or redirect
    return (
      <div className="booking-flow">
        <Header showBack title="Book Session" />
        <div className="booking-flow__empty">
          <h2>Please Log In</h2>
          <p>You need to be logged in to book a session.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Log In</button>
        </div>
      </div>
    )
  }

  // Generate calendar dates for current month
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() // 0 is Sunday
  
  // Adjust so Monday is 0
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1
  
  const days = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  
  const getDayName = (dateNum) => {
    const d = new Date(currentYear, currentMonth, dateNum)
    const daysArr = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return daysArr[d.getDay()]
  }

  const handleConfirm = () => {
    const newBooking = {
      id: Date.now(),
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerCategory: trainer.category,
      date: new Date(currentYear, currentMonth, selectedDate).toLocaleDateString(),
      time: selectedTime,
      type: sessionType,
      price: trainer.price,
      status: 'upcoming'
    }
    
    const existingBookings = JSON.parse(localStorage.getItem('trainersapp_bookings') || '[]')
    localStorage.setItem('trainersapp_bookings', JSON.stringify([newBooking, ...existingBookings]))
    
    // Also create a chat automatically
    const existingChats = JSON.parse(localStorage.getItem('trainersapp_chats') || '[]')
    if (!existingChats.find(c => c.trainerId === trainer.id)) {
      const newChat = {
        id: Date.now(),
        trainerId: trainer.id,
        lastMessage: "I've booked a session!",
        time: "Just now",
        unread: 0
      }
      localStorage.setItem('trainersapp_chats', JSON.stringify([newChat, ...existingChats]))
    }
    
    navigate('/bookings')
  }

  return (
    <div className="booking-flow">
      <div className="booking-flow__header">
        <button className="btn btn--icon btn--ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="booking-flow__steps">
          <div className={`booking-flow__step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`booking-flow__step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`booking-flow__step-dot ${step >= 2 ? 'active' : ''}`} />
          <div className={`booking-flow__step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`booking-flow__step-dot ${step >= 3 ? 'active' : ''}`} />
        </div>
      </div>

      <div className="booking-flow__content">
        {step === 1 && (
          <div className="booking-flow__step animation-slide-in">
            <h2 className="booking-flow__title">Select Session Type</h2>
            <p className="booking-flow__subtitle">How would you like to train with {trainer.name.split(' ')[0]}?</p>
            
            <div className="booking-flow__type-grid">
              {trainer.sessionTypes.map((type, i) => (
                <div 
                  key={i} 
                  className={`card booking-flow__type-card ${sessionType === type ? 'active' : ''}`}
                  onClick={() => setSessionType(type)}
                >
                  <div className="booking-flow__type-check">
                    {sessionType === type && <CheckCircle size={20} />}
                  </div>
                  <h3>{type}</h3>
                  <p>₹{trainer.price} {trainer.priceUnit}</p>
                </div>
              ))}
            </div>
            
            <div className="booking-flow__footer">
              <button 
                className="btn btn--primary btn--block" 
                disabled={!sessionType}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-flow__step animation-slide-in">
            <h2 className="booking-flow__title">Select Date & Time</h2>
            <p className="booking-flow__subtitle">Choose when you'd like to train.</p>
            
            <div className="card booking-flow__calendar-card">
              <div className="booking-flow__month">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              
              <div className="booking-flow__weekdays">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>
              
              <div className="booking-flow__days">
                {days.map((day, i) => {
                  if (!day) return <div key={i} className="booking-flow__day empty" />
                  
                  const isPast = day < today.getDate()
                  const dayName = getDayName(day)
                  const isAvailable = !isPast && trainer.availability[dayName] && trainer.availability[dayName].length > 0
                  
                  return (
                    <button 
                      key={i} 
                      className={`booking-flow__day ${selectedDate === day ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedDate(day)
                        setSelectedTime('') // Reset time when date changes
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {selectedDate && (
              <div className="booking-flow__times">
                <h3>Available Times</h3>
                <div className="booking-flow__time-grid">
                  {trainer.availability[getDayName(selectedDate)].map((time, i) => (
                    <button 
                      key={i}
                      className={`booking-flow__time-btn ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="booking-flow__footer">
              <button 
                className="btn btn--primary btn--block" 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-flow__step animation-slide-in">
            <h2 className="booking-flow__title">Confirm Booking</h2>
            <p className="booking-flow__subtitle">Review your session details.</p>
            
            <div className="card booking-flow__summary">
              <div className="booking-flow__summary-trainer">
                <div className="avatar avatar--md">
                  <span className="avatar__initials">{trainer.name.charAt(0)}</span>
                </div>
                <div>
                  <h3>{trainer.name}</h3>
                  <p>{sessionType}</p>
                </div>
              </div>
              
              <div className="divider divider--spaced" />
              
              <div className="booking-flow__summary-details">
                <div className="booking-flow__summary-row">
                  <CalendarIcon size={18} />
                  <span>{new Date(currentYear, currentMonth, selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="booking-flow__summary-row">
                  <Clock size={18} />
                  <span>{selectedTime}</span>
                </div>
              </div>
              
              <div className="divider divider--spaced" />
              
              <div className="booking-flow__summary-price">
                <span>Total to pay</span>
                <span className="price">₹{trainer.price}</span>
              </div>
            </div>
            
            <div className="card booking-flow__payment">
              <h3><CreditCard size={18} /> Payment Method</h3>
              <p>For this MVP, no actual payment is processed. Clicking confirm will create the booking.</p>
            </div>
            
            <div className="booking-flow__footer">
              <button className="btn btn--primary btn--block" onClick={handleConfirm}>
                Confirm & Pay ₹{trainer.price}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingFlow
