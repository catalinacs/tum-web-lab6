import quotes from '../utils/quotes';

const TYPE_COLORS = {
  Test:       '#f4a7b9',
  Quiz:       '#a8d8ea',
  Assignment: '#b5ead7',
  Deadline:   '#ffd97d',
};

function classifyEvents(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey   = today.toISOString().slice(0, 10);
  const weekEnd    = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const weekEndKey = weekEnd.toISOString().slice(0, 10);

  const upcoming = events
    .filter(ev => ev.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  const todayEvents   = upcoming.filter(ev => ev.date === todayKey);
  const weekEvents    = upcoming.filter(ev => ev.date > todayKey && ev.date <= weekEndKey);
  const laterEvents   = upcoming.filter(ev => ev.date > weekEndKey);

  return { todayEvents, weekEvents, laterEvents };
}

function EventCard({ ev, courseMap, onDismiss }) {
  const course = courseMap[ev.courseId];
  return (
    <div className="dashboard-event-card">
      <span
        className="event-type-badge"
        style={{ backgroundColor: TYPE_COLORS[ev.type] ?? '#eee' }}
      >
        {ev.type}
      </span>
      <div className="dashboard-event-info">
        <span className="dashboard-event-title">{ev.title}</span>
        {course && (
          <span className="dashboard-event-course" style={{ color: course.color }}>
            <span style={{
              display: 'inline-block', width: 7, height: 7,
              borderRadius: '50%', backgroundColor: course.color, marginRight: 4
            }} />
            {course.name}
          </span>
        )}
      </div>
      <span className="dashboard-event-date">{ev.date}</span>
      <button className="dashboard-dismiss" onClick={() => onDismiss(ev.id)} title="Dismiss">✕</button>
    </div>
  );
}

function Section({ title, events, courseMap, onDismiss, urgency }) {
  if (!events.length) return null;
  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <span className="dashboard-section-label" data-urgency={urgency}>{title}</span>
        <span className="dashboard-section-count">{events.length}</span>
      </div>
      <div className="dashboard-event-list">
        {events.map(ev => (
          <EventCard key={ev.id} ev={ev} courseMap={courseMap} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ events, setEvents, courses }) {
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
  const { todayEvents, weekEvents, laterEvents } = classifyEvents(events);
  const hasAny = todayEvents.length + weekEvents.length + laterEvents.length > 0;

  const quote = quotes[new Date().getDate() % quotes.length];

  const dismiss = (id) => setEvents(prev => prev.filter(ev => ev.id !== id));

  return (
    <div className="dashboard-page">
      <div className="dashboard-quote card">{quote}</div>

      <div className="card">
        <p className="section-title">Upcoming</p>
        {!hasAny ? (
          <p className="empty-state">No upcoming events. Add some from the Calendar.</p>
        ) : (
          <>
            <Section title="Today" urgency="today" events={todayEvents} courseMap={courseMap} onDismiss={dismiss} />
            <Section title="This Week" urgency="week" events={weekEvents} courseMap={courseMap} onDismiss={dismiss} />
            <Section title="Later" urgency="later" events={laterEvents} courseMap={courseMap} onDismiss={dismiss} />
          </>
        )}
      </div>
    </div>
  );
}
