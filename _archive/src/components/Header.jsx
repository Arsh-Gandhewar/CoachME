import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({
  title = '',
  showBack = false,
  rightAction = null,
  transparent = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header
      className={`header ${transparent ? 'header--transparent' : ''}`}
    >
      <div className="header__inner">
        <div className="header__left">
          {showBack && (
            <button
              className="header__back"
              onClick={handleBack}
              aria-label="Go back"
              type="button"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
          )}
        </div>

        <h1 className="header__title">{title}</h1>

        <div className="header__right">
          {rightAction || <span className="header__spacer" />}
        </div>
      </div>
    </header>
  );
}

export default Header;
