const TYPE_COLORS = {
  Test:       '#E05C5C',
  Quiz:       '#4BAFD6',
  Assignment: '#93C572',
  Deadline:   '#F4C430',
};

export default function DayModal({ date, events, onClose, onAdd, onEdit, onDelete }) {
  const dayEvents = events.filter(ev => ev.date === date);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">
            {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="day-modal-events">
          {dayEvents.length === 0 && (
            <p className="empty-state" style={{ margin: '0.5rem 0' }}>No events on this day.</p>
          )}
          {dayEvents.map(ev => {
            return (
              <div key={ev.id} className="day-modal-event-row">
                <span
                  className="event-type-badge"
                  style={{ backgroundColor: TYPE_COLORS[ev.type] ?? '#eee' }}
                >
                  {ev.type}
                </span>
                <span className="day-modal-event-title">{ev.title}</span>
                <div className="day-modal-event-actions">
                  <button className="day-modal-icon-btn" onClick={() => onEdit(ev)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="day-modal-icon-btn danger" onClick={() => onDelete(ev.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions" style={{ marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={onAdd}>+ Add Event</button>
        </div>
      </div>
    </div>
  );
}
