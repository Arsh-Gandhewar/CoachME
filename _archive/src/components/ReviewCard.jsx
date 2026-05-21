import { Star } from 'lucide-react';

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ReviewCard({ review }) {
  const { userName, rating, date, text } = review;
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  return (
    <article className="review-card">
      <div className="review-card__header">
        <div
          className="review-card__avatar"
          style={{ backgroundColor: avatarColor }}
        >
          <span>{initials}</span>
        </div>

        <div className="review-card__meta">
          <h4 className="review-card__name">{userName}</h4>
          <div className="review-card__rating-row">
            <div className="review-card__stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={13}
                  strokeWidth={2}
                  className={
                    i < rating
                      ? 'review-card__star--filled'
                      : 'review-card__star--empty'
                  }
                  fill={i < rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="review-card__date">{formatDate(date)}</span>
          </div>
        </div>
      </div>

      <p className="review-card__text">{text}</p>
    </article>
  );
}

export default ReviewCard;
