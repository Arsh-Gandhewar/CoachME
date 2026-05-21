import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, MapPin, Award, CheckCircle, Clock, Calendar, MessageCircle } from 'lucide-react'
import { categories } from '../data/trainers'
import { trainerAPI } from '../services/api'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import Badge from '../components/Badge'
import ReviewCard from '../components/ReviewCard'
import './TrainerProfile.css'

function TrainerProfile({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showFullBio, setShowFullBio] = useState(false)
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    trainerAPI.getById(id)
      .then(res => {
        setTrainer(res.data)
        setLoading(false)
      })
      .catch(() => {
        setTrainer(null)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <div className="trainer-profile__loading" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'var(--text-secondary)'}}>Loading...</div>
  }

  if (!trainer) {
    return (
      <div className="trainer-profile__not-found">
        <Header showBack title="Trainer Not Found" />
        <div className="trainer-profile__empty">
          <p>We couldn't find the trainer you were looking for.</p>
          <button className="btn btn--primary" onClick={() => navigate('/search')}>Browse Trainers</button>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.id === trainer.category)

  return (
    <div className="trainer-profile">
      <Header 
        transparent 
        showBack 
        rightAction={<button className="btn btn--icon btn--ghost"><Share2 size={20} /></button>} 
      />
      
      <div className="trainer-profile__hero" style={{ background: category?.gradient || 'var(--bg-secondary)' }}>
        <div className="trainer-profile__avatar-container">
          <div className="avatar avatar--xl avatar--ring">
            <span className="avatar__initials">{trainer.name.charAt(0)}</span>
          </div>
        </div>
      </div>

      <div className="trainer-profile__content">
        <div className="trainer-profile__header-info">
          <h1 className="trainer-profile__name">{trainer.name}</h1>
          <div className="trainer-profile__badges">
            {trainer.verified && <Badge variant="verified" icon={CheckCircle} text="Verified" />}
            {trainer.premium && <Badge variant="premium" icon={Award} text="Premium" />}
            <Badge variant="category" text={category?.name || trainer.category} />
          </div>
        </div>

        <div className="trainer-profile__stats-row">
          <div className="trainer-profile__stat-item">
            <StarRating rating={trainer.rating} count={trainer.reviewCount} size="md" />
          </div>
          <div className="trainer-profile__stat-item">
            <MapPin size={16} />
            <span>{trainer.distance} km away</span>
          </div>
          <div className="trainer-profile__stat-item">
            <Clock size={16} />
            <span>{trainer.experience} yrs exp</span>
          </div>
        </div>

        <section className="trainer-profile__section">
          <h2 className="trainer-profile__section-title">About Me</h2>
          <p className={`trainer-profile__bio ${showFullBio ? 'trainer-profile__bio--expanded' : ''}`}>
            {trainer.bio}
          </p>
          {trainer.bio.length > 150 && (
            <button className="trainer-profile__read-more" onClick={() => setShowFullBio(!showFullBio)}>
              {showFullBio ? 'Show less' : 'Read more'}
            </button>
          )}
        </section>

        <section className="trainer-profile__section">
          <h2 className="trainer-profile__section-title">Specializations</h2>
          <div className="tags-wrap">
            {trainer.specializations.map((spec, i) => (
              <span key={i} className="tag tag--accent">{spec}</span>
            ))}
          </div>
        </section>

        <section className="trainer-profile__section">
          <h2 className="trainer-profile__section-title">Certifications</h2>
          <ul className="trainer-profile__list">
            {trainer.certifications.map((cert, i) => (
              <li key={i} className="trainer-profile__list-item">
                <Award size={18} className="trainer-profile__list-icon" />
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="trainer-profile__section">
          <h2 className="trainer-profile__section-title">Session Types</h2>
          <div className="tags-wrap">
            {trainer.sessionTypes.map((type, i) => (
              <span key={i} className="tag">{type}</span>
            ))}
          </div>
        </section>

        <section className="trainer-profile__section">
          <div className="trainer-profile__section-header">
            <h2 className="trainer-profile__section-title">Reviews</h2>
            <span className="trainer-profile__review-count">{trainer.reviewCount} total</span>
          </div>
          <div className="trainer-profile__reviews-list">
            {trainer.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </div>

      <div className="trainer-profile__footer">
        <div className="trainer-profile__price-wrap">
          <span className="trainer-profile__price">₹{trainer.price}</span>
          <span className="trainer-profile__price-unit">{trainer.priceUnit}</span>
        </div>
        <div className="trainer-profile__footer-actions">
          <button className="btn btn--icon btn--secondary" onClick={() => navigate(`/chat/${trainer.id}`)}>
            <MessageCircle size={20} />
          </button>
          <button className="btn btn--primary trainer-profile__book-btn" onClick={() => navigate(`/booking/${trainer.id}`)}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile
