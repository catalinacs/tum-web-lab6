import SessionLog from './SessionLog';

function calcStreak(sessions) {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map((s) => new Date(s.completedAt).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function StatsPanel({ sessions, setSessions, courses }) {
  const handleDeleteSession = (id) => setSessions(prev => prev.filter(s => s.id !== id));
  const totalSessions = sessions.length;
  const totalMinutes  = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const streak        = calcStreak(sessions);

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  const countByCourse = sessions.reduce((acc, s) => {
    const key = s.courseId ?? '__none__';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stats-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalMinutes}</div>
          <div className="stat-label">Minutes Studied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      {totalSessions > 0 && (
        <div className="card">
          <p className="section-title">Sessions by Course</p>
          <div className="course-bar-row">
            {Object.entries(countByCourse).map(([courseId, count]) => {
              const course = courseMap[courseId];
              const label  = course?.name  ?? 'No course';
              const color  = course?.color;
              const barColor = color ?? '#ccc';
              const pct    = Math.round((count / totalSessions) * 100);

              return (
                <div key={courseId} className="course-bar-item">
                  <div className="course-bar-label">
                    <span className="session-course-name course-bar-name">{label}</span>
                    <span className="course-bar-pct">{count} ({pct}%)</span>
                  </div>
                  <div className="course-bar-track">
                    <div className="course-bar-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <p className="section-title">Session Log</p>
        <SessionLog courses={courses} sessions={sessions} onDeleteSession={handleDeleteSession} />
      </div>
    </div>
  );
}
