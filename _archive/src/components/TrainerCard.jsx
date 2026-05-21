import { MapPin, Shield, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = [
  '#FF5722', '#7C4DFF', '#00BCD4', '#4CAF50',
  '#E91E63', '#FF9800', '#2196F3', '#F44336',
];

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN').format(price);
}

function TrainerCard({ trainer }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trainer/${trainer.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const initials = getInitials(trainer.name);
  const avatarColor = getAvatarColor(trainer.name);

  return (
    <article
      className="trainer-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${trainer.name}'s profile`}
    >
      <div className="trainer-card__image-wrapper">
        {trainer.image ? (
          <img
            src={trainer.image}
            alt={trainer.name}
            className="trainer-card__image"
            loading="lazy"
          />
        ) : (
          <div
            className="trainer-card__avatar"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="trainer-card__initials">{initials}</span>
          </div>
        )}

        {trainer.premium && (
          <span className="trainer-card__premium-badge">
            <Award size={12} strokeWidth={2.5} />
            <span>Premium</span>
          </span>
        )}
      </div>

      <div className="trainer-card__content">
        <div className="trainer-card__header">
          <h3 className="trainer-card__name">
            {trainer.name}
            {trainer.verified && (
              <span className="trainer-card__verified" aria-label="Verified trainer">
                <Shield size={14} strokeWidth={2.5} />
              </span>
            )}
          </h3>
        </div>

        <span className="trainer-card__category">{trainer.category}</span>

        <div className="trainer-card__rating">
          <Star size={14} strokeWidth={2.5} className="trainer-card__star" />
          <span className="trainer-card__rating-value">{trainer.rating}</span>
          <span className="trainer-card__review-count">
            ({trainer.reviewCount})
          </span>
        </div>

        <div className="trainer-card__footer">
          <div className="trainer-card__location">
            <MapPin size={13} strokeWidth={2} />
            <span>{trainer.location}</span>
          </div>
          <div className="trainer-card__price">
            <span className="trainer-card__price-value">
              ₹{formatPrice(trainer.price)}
            </span>
            <span className="trainer-card__price-unit">
              /{trainer.priceUnit?.replace('per ', '') || 'session'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default TrainerCard;
