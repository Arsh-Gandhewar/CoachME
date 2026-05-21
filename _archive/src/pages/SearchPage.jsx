import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  X,
  SearchX,
  Star,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import TrainerCard from '../components/TrainerCard';
import { categories } from '../data/trainers';
import { trainerAPI } from '../services/api';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'price-low', label: 'Price: Low–High' },
  { value: 'price-high', label: 'Price: High–Low' },
  { value: 'experience', label: 'Experience' },
];

const SESSION_TYPE_OPTIONS = [
  'Personal Training',
  'Group Sessions',
  'Online Coaching',
];

const MIN_PRICE = 0;
const MAX_PRICE = 5000;
const PRICE_STEP = 100;

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [minRating, setMinRating] = useState(0);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    trainerAPI.getAll().then(res => setTrainers(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setQuery(q);
    setActiveCategory(cat);
  }, [searchParams]);

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleQueryChange = (value) => {
    setQuery(value);
    updateParams({ q: value });
  };

  const handleCategoryClick = (catId) => {
    const next = activeCategory === catId ? '' : catId;
    setActiveCategory(next);
    updateParams({ category: next });
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setSortOpen(false);
  };

  const toggleSessionType = (type) => {
    setSessionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setMinRating(0);
    setSessionTypes([]);
  };

  const hasActiveFilters =
    priceRange[0] !== MIN_PRICE ||
    priceRange[1] !== MAX_PRICE ||
    minRating > 0 ||
    sessionTypes.length > 0;

  const filteredTrainers = useMemo(() => {
    let results = [...trainers];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q)) ||
          t.location.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.bio.toLowerCase().includes(q)
      );
    }

    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }

    results = results.filter(
      (t) => t.price >= priceRange[0] && t.price <= priceRange[1]
    );

    if (minRating > 0) {
      results = results.filter((t) => t.rating >= minRating);
    }

    if (sessionTypes.length > 0) {
      results = results.filter((t) =>
        sessionTypes.some((st) => t.sessionTypes.includes(st))
      );
    }

    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'experience':
        results.sort((a, b) => b.experience - a.experience);
        break;
      default:
        results.sort(
          (a, b) =>
            b.rating * b.reviewCount * (b.premium ? 1.3 : 1) -
            a.rating * a.reviewCount * (a.premium ? 1.3 : 1)
        );
    }

    return results;
  }, [query, activeCategory, sortBy, priceRange, minRating, sessionTypes]);

  const formatPrice = (val) => `₹${new Intl.NumberFormat('en-IN').format(val)}`;

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Relevance';

  return (
    <div className="search-page">
      {/* ── Header ────────────────────────── */}
      <header className="search-page__header">
        <button
          className="search-page__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>

        <div className="search-page__search-wrap">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            onFilterClick={() => setFilterOpen((p) => !p)}
            placeholder="Search trainers, activities..."
          />
        </div>
      </header>

      {/* ── Category Chips ────────────────── */}
      <div className="search-page__categories">
        <div className="search-page__categories-track">
          <button
            className={`search-page__chip ${
              !activeCategory ? 'search-page__chip--active' : ''
            }`}
            onClick={() => handleCategoryClick('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`search-page__chip ${
                activeCategory === cat.id ? 'search-page__chip--active' : ''
              }`}
              onClick={() => handleCategoryClick(cat.id)}
              style={
                activeCategory === cat.id
                  ? { background: cat.gradient, borderColor: 'transparent' }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Controls Row ──────────────────── */}
      <div className="search-page__controls">
        <span className="search-page__count">
          {filteredTrainers.length}{' '}
          {filteredTrainers.length === 1 ? 'trainer' : 'trainers'} found
        </span>

        <div className="search-page__controls-right">
          {/* Sort Dropdown */}
          <div className="search-page__sort-wrapper">
            <button
              className="search-page__sort-btn"
              onClick={() => setSortOpen((p) => !p)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
            >
              <span>{activeSortLabel}</span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`search-page__sort-chevron ${
                  sortOpen ? 'search-page__sort-chevron--open' : ''
                }`}
              />
            </button>

            {sortOpen && (
              <>
                <div
                  className="search-page__sort-backdrop"
                  onClick={() => setSortOpen(false)}
                />
                <ul className="search-page__sort-menu" role="listbox">
                  {SORT_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      className={`search-page__sort-option ${
                        sortBy === opt.value
                          ? 'search-page__sort-option--active'
                          : ''
                      }`}
                      role="option"
                      aria-selected={sortBy === opt.value}
                      onClick={() => handleSortSelect(opt.value)}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Filter Toggle (mobile) */}
          <button
            className={`search-page__filter-toggle ${
              hasActiveFilters ? 'search-page__filter-toggle--active' : ''
            }`}
            onClick={() => setFilterOpen((p) => !p)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={18} strokeWidth={2} />
            {hasActiveFilters && (
              <span className="search-page__filter-dot" />
            )}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ──────────────────── */}
      {filterOpen && (
        <div className="search-page__filters animate-slide-up">
          <div className="search-page__filters-header">
            <h3 className="search-page__filters-title">Filters</h3>
            {hasActiveFilters && (
              <button
                className="search-page__filters-clear"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
            <button
              className="search-page__filters-close"
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Price Range */}
          <div className="search-page__filter-group">
            <label className="search-page__filter-label">Price Range</label>
            <div className="search-page__price-display">
              <span>{formatPrice(priceRange[0])}</span>
              <span className="search-page__price-sep">—</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            <div className="search-page__range-inputs">
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([
                    Math.min(Number(e.target.value), priceRange[1] - PRICE_STEP),
                    priceRange[1],
                  ])
                }
                className="search-page__range"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([
                    priceRange[0],
                    Math.max(Number(e.target.value), priceRange[0] + PRICE_STEP),
                  ])
                }
                className="search-page__range"
                aria-label="Maximum price"
              />
            </div>
          </div>

          {/* Min Rating */}
          <div className="search-page__filter-group">
            <label className="search-page__filter-label">Minimum Rating</label>
            <div className="search-page__rating-chips">
              {[0, 3, 3.5, 4, 4.5].map((val) => (
                <button
                  key={val}
                  className={`search-page__rating-chip ${
                    minRating === val ? 'search-page__rating-chip--active' : ''
                  }`}
                  onClick={() => setMinRating(val)}
                >
                  {val === 0 ? (
                    'Any'
                  ) : (
                    <>
                      <Star size={13} strokeWidth={2.5} fill="currentColor" />
                      {val}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Session Type */}
          <div className="search-page__filter-group">
            <label className="search-page__filter-label">Session Type</label>
            <div className="search-page__session-chips">
              {SESSION_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  className={`search-page__session-chip ${
                    sessionTypes.includes(type)
                      ? 'search-page__session-chip--active'
                      : ''
                  }`}
                  onClick={() => toggleSessionType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            className="search-page__filters-apply btn btn--primary"
            onClick={() => setFilterOpen(false)}
          >
            Show {filteredTrainers.length} results
          </button>
        </div>
      )}

      {/* ── Results ───────────────────────── */}
      <div className="search-page__results">
        {filteredTrainers.length > 0 ? (
          <div className="search-page__grid">
            {filteredTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        ) : (
          <div className="search-page__empty">
            <div className="search-page__empty-icon">
              <SearchX size={52} strokeWidth={1.3} />
            </div>
            <h3 className="search-page__empty-title">No trainers found</h3>
            <p className="search-page__empty-text">
              Try adjusting your filters or search with different keywords.
            </p>
            <button
              className="btn btn--secondary search-page__empty-btn"
              onClick={() => {
                setQuery('');
                setActiveCategory('');
                clearFilters();
                updateParams({ q: '', category: '' });
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="search-page__bottom-spacer" />
    </div>
  );
}

export default SearchPage;
