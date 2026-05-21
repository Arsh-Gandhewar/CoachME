import {
  Dumbbell,
  Heart,
  Waves,
  Target,
  Swords,
  Music,
  Trophy,
  CircleDot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  dumbbell: Dumbbell,
  heart: Heart,
  waves: Waves,
  target: Target,
  swords: Swords,
  music: Music,
  trophy: Trophy,
  'circle-dot': CircleDot,
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[category.icon] || Dumbbell;

  const handleClick = () => {
    navigate(`/search?category=${category.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="category-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Browse ${category.name} trainers`}
      style={{ background: category.gradient }}
    >
      <div className="category-card__icon-wrapper">
        <IconComponent size={28} strokeWidth={1.8} className="category-card__icon" />
      </div>
      <span className="category-card__name">{category.name}</span>
    </div>
  );
}

export default CategoryCard;
