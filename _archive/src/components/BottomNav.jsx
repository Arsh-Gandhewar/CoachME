import { Home, Search, Calendar, MessageCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Explore' },
  { path: '/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              className={`bottom-nav__tab ${active ? 'bottom-nav__tab--active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {active && <span className="bottom-nav__indicator" />}
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.6}
                className="bottom-nav__icon"
              />
              <span className="bottom-nav__label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
