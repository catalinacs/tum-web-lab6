export default function SessionLog({ sessions, courses, onDeleteSession }) {
  if (!sessions.length) {
    return <p className="empty-state">No study sessions yet. Complete a timer to see your log.</p>;
  }

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <ul className="session-log">
      {sessions.slice().reverse().map((session) => {
        const course     = courseMap[session.courseId];
        const color      = course?.color;
        const courseName = course?.name ?? 'No course';

        return (
          <li key={session.id} className="session-item">
            {color && <span className="timer-dot" style={{ backgroundColor: color }} />}
            <span className="session-course-name" style={color ? { color } : {}}>{courseName}</span>
            <span className="session-meta">{session.duration} min · {formatDate(session.completedAt)}</span>
            {onDeleteSession && (
              <button
                className="session-delete-btn"
                onClick={() => onDeleteSession(session.id)}
                title="Delete session"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
