import { useState } from 'react';

const TYPE_COLORS = {
  Test:       '#f4a7b9',
  Quiz:       '#a8d8ea',
  Assignment: '#93C572',
  Deadline:   '#ffd97d',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function EventCalendar({ events, onDayClick }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow    = getFirstDayOfWeek(viewYear, viewMonth);

  const eventsByDay = events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const upcoming = events
    .filter((ev) => ev.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-page">
      <div className="calendar-left">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>{'<'}</button>
          <span className="calendar-month-label">{monthLabel}</span>
          <button className="calendar-nav-btn" onClick={nextMonth}>{'>'}</button>
        </div>

        <div className="calendar-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="calendar-dow">{d}</div>
          ))}
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const key       = toDateKey(viewYear, viewMonth, day);
            const hasEvents = !!eventsByDay[key];
            const isToday   = key === todayKey;
            const isPast    = key < todayKey;

            let cls = 'calendar-day';
            if (isToday)              cls += ' calendar-day--today';
            if (hasEvents && !isPast) cls += ' calendar-day--has-events';
            if (hasEvents && isPast)  cls += ' calendar-day--past-events';

            return (
              <button key={key} className={cls} onClick={() => onDayClick && onDayClick(key)}>
                {day}
                {hasEvents && !isPast && <span className="calendar-day-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-right">
        <p className="section-title">Upcoming</p>
        {upcoming.length === 0 ? (
          <p className="empty-state">No upcoming events.</p>
        ) : (
          <ul className="upcoming-list">
            {upcoming.map((ev) => (
              <li key={ev.id} className="upcoming-item">
                <span
                  className="event-type-badge"
                  style={{ backgroundColor: TYPE_COLORS[ev.type] ?? '#eee' }}
                >
                  {ev.type}
                </span>
                <span className="upcoming-title">{ev.title}</span>
                <span className="upcoming-date">{new Date(ev.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
