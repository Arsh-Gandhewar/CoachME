import { Search, Filter } from 'lucide-react';

function SearchBar({
  value = '',
  onChange,
  onFilterClick,
  placeholder = 'Search trainers, activities...',
}) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  return (
    <div className="search-bar">
      <div className="search-bar__icon">
        <Search size={20} strokeWidth={2} />
      </div>

      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Search"
      />

      {onFilterClick && (
        <button
          className="search-bar__filter"
          onClick={onFilterClick}
          aria-label="Open filters"
          type="button"
        >
          <Filter size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
