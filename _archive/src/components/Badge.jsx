function Badge({ text, variant = 'default', icon: Icon = null }) {
  return (
    <span className={`badge badge--${variant}`}>
      {Icon && (
        <Icon size={12} strokeWidth={2.5} className="badge__icon" />
      )}
      <span className="badge__text">{text}</span>
    </span>
  );
}

export default Badge;
