import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronRight, TrendingUp, Zap, Shield, Star } from 'lucide-react'
import TrainerCard from '../components/TrainerCard'
import CategoryCard from '../components/CategoryCard'
import { categories } from '../data/trainers'
import { trainerAPI } from '../services/api'
import './HomePage.css'

function HomePage({ user }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredTrainers, setFeaturedTrainers] = useState([])
  const [topRated, setTopRated] = useState([])

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await trainerAPI.getAll()
        const fetchedTrainers = res.data

        const featured = fetchedTrainers
          .filter(t => t.premium)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6)
        setFeaturedTrainers(featured)

        const top = [...fetchedTrainers]
          .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
          .slice(0, 4)
        setTopRated(top)
      } catch (err) {
        console.error('Failed to fetch trainers', err)
      }
    }
    fetchTrainers()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const stats = [
    { value: '500+', label: 'Verified Trainers', icon: Shield },
    { value: '20+', label: 'Activities', icon: Zap },
    { value: '50K+', label: 'Sessions Booked', icon: TrendingUp },
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-bg">
          <div className="home__hero-gradient" />
          <div className="home__hero-pattern" />
        </div>
        <div className="home__hero-content">
          <div className="home__greeting">
            {user ? (
              <p className="home__welcome">Welcome back, <span>{user.name.split(' ')[0]}</span></p>
            ) : (
              <p className="home__welcome">Find your perfect</p>
            )}
            <h1 className="home__title">
              {user ? 'Ready to train?' : 'Trainer'}
            </h1>
          </div>

          <form className="home__search" onSubmit={handleSearch}>
            <div className="search-bar">
              <Search className="search-bar__icon" size={20} />
              <input
                type="text"
                className="search-bar__input"
                placeholder="Search trainers, yoga, gym..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="home__location">
            <MapPin size={14} />
            <span>Mumbai, India</span>
            <button className="home__location-btn">Change</button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="home__stats">
        {stats.map((stat, i) => (
          <div className="home__stat" key={i}>
            <stat.icon size={18} className="home__stat-icon" />
            <div>
              <span className="home__stat-value">{stat.value}</span>
              <span className="home__stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Browse Categories</h2>
          <button className="home__section-link" onClick={() => navigate('/search')}>
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="categories-scroll">
          <div className="categories-scroll__track">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trainers */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Featured Trainers</h2>
          <button className="home__section-link" onClick={() => navigate('/search')}>
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="home__trainers-grid">
          {featuredTrainers.map(trainer => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="home__section home__how-it-works">
        <h2 className="home__section-title">How It Works</h2>
        <div className="home__steps">
          <div className="home__step">
            <div className="home__step-number">1</div>
            <h3>Discover</h3>
            <p>Browse trainers by category, location, ratings, and price</p>
          </div>
          <div className="home__step">
            <div className="home__step-number">2</div>
            <h3>Compare</h3>
            <p>Check profiles, certifications, reviews, and achievements</p>
          </div>
          <div className="home__step">
            <div className="home__step-number">3</div>
            <h3>Book</h3>
            <p>Schedule a session, pay securely, and start training</p>
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            <Star size={20} className="home__section-icon" /> Top Rated
          </h2>
        </div>
        <div className="home__trainers-list">
          {topRated.map(trainer => (
            <TrainerCard key={trainer.id} trainer={trainer} variant="horizontal" />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home__cta">
        <div className="home__cta-content">
          <h2>Are you a trainer?</h2>
          <p>Join our platform and reach thousands of potential clients</p>
          <button className="btn btn--primary" onClick={() => navigate('/register')}>
            Register as Trainer
          </button>
        </div>
      </section>

      <div className="home__bottom-spacer" />
    </div>
  )
}

export default HomePage
