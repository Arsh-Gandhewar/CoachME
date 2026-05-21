function SkeletonPulse({ className = '' }) {
  return <div className={`skeleton-pulse ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="skeleton skeleton--card">
      <SkeletonPulse className="skeleton__image" />
      <div className="skeleton__body">
        <SkeletonPulse className="skeleton__title" />
        <SkeletonPulse className="skeleton__badge" />
        <SkeletonPulse className="skeleton__line skeleton__line--short" />
        <div className="skeleton__footer">
          <SkeletonPulse className="skeleton__line skeleton__line--medium" />
          <SkeletonPulse className="skeleton__price" />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="skeleton skeleton--profile">
      <SkeletonPulse className="skeleton__avatar-large" />
      <SkeletonPulse className="skeleton__title skeleton__title--centered" />
      <SkeletonPulse className="skeleton__subtitle skeleton__subtitle--centered" />
      <div className="skeleton__stats">
        <SkeletonPulse className="skeleton__stat" />
        <SkeletonPulse className="skeleton__stat" />
        <SkeletonPulse className="skeleton__stat" />
      </div>
      <SkeletonPulse className="skeleton__block" />
      <SkeletonPulse className="skeleton__block skeleton__block--short" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="skeleton skeleton--list">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton__list-item">
          <SkeletonPulse className="skeleton__avatar-small" />
          <div className="skeleton__list-content">
            <SkeletonPulse className="skeleton__line skeleton__line--medium" />
            <SkeletonPulse className="skeleton__line skeleton__line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

const VARIANT_MAP = {
  card: CardSkeleton,
  profile: ProfileSkeleton,
  list: ListSkeleton,
};

function LoadingSkeleton({ variant = 'card', count = 1 }) {
  const SkeletonVariant = VARIANT_MAP[variant] || VARIANT_MAP.card;

  return (
    <div className="loading-skeleton" role="status" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonVariant key={i} />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
