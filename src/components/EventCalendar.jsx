import { useState } from 'react';

const TYPE_COLORS = {
  Test:       '#f4a7b9',
  Quiz:       '#a8d8ea',
  Assignment: '#b5ead7',
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
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  const eventsByDay = events.reduce((acc, ev) => {
    const key = ev.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
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
    month: 'long',
    year: 'numeric',
  });

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const upcoming = events
    .filter((ev) => ev.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={prevMonth}>{'<'}</button>
          <strong>{monthLabel}</strong>
          <button onClick={nextMonth}>{'>'}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 2 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>{d}</div>
          ))}
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const key = toDateKey(viewYear, viewMonth, day);
            const hasEvents = !!eventsByDay[key];
            const isToday = key === todayKey;

            return (
              <button
                key={key}
                onClick={() => onDayClick && onDayClick(key)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  border: isToday ? '2px solid #888' : '1px solid #ddd',
                  fontWeight: hasEvents ? 'bold' : 'normal',
                  backgroundColor: hasEvents ? '#f0e6ff' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {day}
                {hasEvents && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: '#888',
                      display: 'block',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Upcoming</h3>
        {upcoming.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {upcoming.map((ev) => (
              <li key={ev.id} style={{ marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '1px 6px',
                    borderRadius: 4,
                    backgroundColor: TYPE_COLORS[ev.type] ?? '#eee',
                    fontSize: 11,
                    marginRight: 8,
                  }}
                >
                  {ev.type}
                </span>
                <span>{ev.date} — {ev.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
