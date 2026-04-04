function calcStreak(sessions) {
  if (!sessions.length) return 0;

  const days = new Set(
    sessions.map((s) => new Date(s.completedAt).toDateString())
  );

  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function StatsPanel({ sessions, courses }) {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const streak = calcStreak(sessions);

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  const countByCourse = sessions.reduce((acc, s) => {
    const key = s.courseId ?? '__none__';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2>Stats</h2>

      <p>Total sessions: {totalSessions}</p>
      <p>Total minutes studied: {totalMinutes}</p>
      <p>Current streak: {streak} {streak === 1 ? 'day' : 'days'}</p>

      {totalSessions > 0 && (
        <div>
          <h3>Sessions by course</h3>
          {Object.entries(countByCourse).map(([courseId, count]) => {
            const course = courseMap[courseId];
            const label = course?.name ?? 'No course';
            const color = course?.color ?? '#ccc';
            const pct = Math.round((count / totalSessions) * 100);

            return (
              <div key={courseId}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: color,
                    marginRight: 6,
                  }}
                />
                <span>{label}</span>
                <span> — {count} ({pct}%)</span>
                <div
                  style={{
                    height: 8,
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRadius: 4,
                    marginTop: 2,
                    marginBottom: 8,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
