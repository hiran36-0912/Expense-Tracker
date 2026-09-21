import { Link } from 'react-router-dom';

function EmptyState({ icon, title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-text">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
