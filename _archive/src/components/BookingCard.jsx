import { Calendar, Clock, X, Star } from 'lucide-react';

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

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', className: 'booking-card__status--upcoming' },
  completed: { label: 'Completed', className: 'booking-card__status--completed' },
  cancelled: { label: 'Cancelled', className: 'booking-card__status--cancelled' },
};

function BookingCard({
  booking,
  onCancel,
  onReview,
}) {
  const {
    trainerName,
    date,
    time,
    sessionType,
    status,
    price,
  } = booking;

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  const initials = getInitials(trainerName);
  const avatarColor = getAvatarColor(trainerName);

  return (
    <article className="booking-card">
      <div className="booking-card__top">
        <div className="booking-card__trainer">
          <div
            className="booking-card__avatar"
            style={{ backgroundColor: avatarColor }}
          >
            <span>{initials}</span>
          </div>
          <div className="booking-card__trainer-info">
            <h3 className="booking-card__name">{trainerName}</h3>
            <span className="booking-card__session-type">{sessionType}</span>
          </div>
        </div>

        <span className={`booking-card__status ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__detail">
          <Calendar size={15} strokeWidth={2} />
          <span>{date}</span>
        </div>
        <div className="booking-card__detail">
          <Clock size={15} strokeWidth={2} />
          <span>{time}</span>
        </div>
      </div>

      <div className="booking-card__bottom">
        <div className="booking-card__price">
          <span className="booking-card__price-label">Total</span>
          <span className="booking-card__price-value">₹{formatPrice(price)}</span>
        </div>

        <div className="booking-card__actions">
          {status === 'upcoming' && onCancel && (
            <button
              className="booking-card__action booking-card__action--cancel"
              onClick={() => onCancel(booking)}
              type="button"
            >
              <X size={14} strokeWidth={2.5} />
              <span>Cancel</span>
            </button>
          )}
          {status === 'completed' && onReview && (
            <button
              className="booking-card__action booking-card__action--review"
              onClick={() => onReview(booking)}
              type="button"
            >
              <Star size={14} strokeWidth={2.5} />
              <span>Review</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
