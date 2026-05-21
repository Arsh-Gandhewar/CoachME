import { useState } from 'react';
import { Star } from 'lucide-react';

const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
};

function StarRating({
  rating = 0,
  count,
  size = 'md',
  interactive = false,
  onChange,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const iconSize = SIZE_MAP[size] || SIZE_MAP.md;
  const displayRating = hoverRating || rating;

  const handleClick = (starIndex) => {
    if (!interactive) return;
    onChange?.(starIndex);
  };

  const handleMouseEnter = (starIndex) => {
    if (!interactive) return;
    setHoverRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const fillPercentage = Math.min(Math.max(displayRating - index, 0), 1) * 100;
    const uniqueId = `star-clip-${size}-${index}-${Math.random().toString(36).slice(2, 8)}`;

    return (
      <span
        key={index}
        className={`star-rating__star ${interactive ? 'star-rating__star--interactive' : ''}`}
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => handleMouseEnter(starValue)}
        onMouseLeave={handleMouseLeave}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(starValue);
          }
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          className="star-rating__svg"
        >
          <defs>
            <clipPath id={uniqueId}>
              <rect x="0" y="0" width={`${fillPercentage}%`} height="100%" />
            </clipPath>
          </defs>
          <Star
            size={iconSize}
            strokeWidth={2}
            className="star-rating__star-empty"
          />
          <g clipPath={`url(#${uniqueId})`}>
            <Star
              size={iconSize}
              strokeWidth={2}
              fill="currentColor"
              className="star-rating__star-filled"
            />
          </g>
        </svg>
      </span>
    );
  };

  return (
    <div className={`star-rating star-rating--${size}`} aria-label={`Rating: ${rating} out of 5`}>
      <div className="star-rating__stars">
        {Array.from({ length: 5 }, (_, i) => renderStar(i))}
      </div>
      {(rating > 0 || count !== undefined) && (
        <div className="star-rating__info">
          {rating > 0 && (
            <span className="star-rating__value">{rating.toFixed(1)}</span>
          )}
          {count !== undefined && (
            <span className="star-rating__count">({count})</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StarRating;
