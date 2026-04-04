export default function SessionLog({ sessions, courses }) {
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
        const color      = course?.color ?? '#ccc';
        const courseName = course?.name  ?? 'No course';

        return (
          <li key={session.id} className="session-item">
            <span className="timer-dot" style={{ backgroundColor: color }} />
            <span className="session-course-name" style={{ color }}>{courseName}</span>
            <span className="session-meta">{session.duration} min · {formatDate(session.completedAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
