export default function SessionLog({ sessions, courses }) {
  if (!sessions.length) {
    return <p>No study sessions yet. Complete a Pomodoro to see your log.</p>;
  }

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <ul>
      {sessions
        .slice()
        .reverse()
        .map((session) => {
          const course = courseMap[session.courseId];
          const color = course?.color ?? '#ccc';
          const courseName = course?.name ?? 'Unknown Course';

          return (
            <li key={session.id}>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: 8,
                }}
              />
              <span style={{ color }}>{courseName}</span>
              <span> — {session.duration} min</span>
              <span> · {formatDate(session.completedAt)}</span>
            </li>
          );
        })}
    </ul>
  );
}
