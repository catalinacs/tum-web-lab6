import { useState } from 'react';
import quotes from '../utils/quotes';
import EventCalendar from './EventCalendar';
import AddEventModal from './AddEventModal';
import DayModal from './DayModal';

const TYPE_COLORS = {
  Test:       '#E05C5C',
  Quiz:       '#4BAFD6',
  Assignment: '#93C572',
  Deadline:   '#F4C430',
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
      <span className="dashboard-event-date">
        {new Date(ev.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
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

export default function Dashboard({ events, setEvents, courses, decks = [], onOpenDeck, onStudyDeck, onAddEvent, modalDate, setModalDate }) {
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
  const { todayEvents, weekEvents, laterEvents } = classifyEvents(events);
  const hasAny = todayEvents.length + weekEvents.length + laterEvents.length > 0;

  const quote = quotes[new Date().getDate() % quotes.length];
  const dismiss = (id) => setEvents(prev => prev.filter(ev => ev.id !== id));
  const recentDecks = [...decks].slice(-6).reverse();

  const [dayModalDate, setDayModalDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addingToDate, setAddingToDate] = useState(null);

  const handleDayClick = (date) => setDayModalDate(date);
  const handleEditEvent = (id, updates) => setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
  const handleDeleteEvent = (id) => setEvents(prev => prev.filter(ev => ev.id !== id));

  return (
    <div className="dashboard-page">
      <div className="dashboard-quote card">{quote}</div>

      <div className="card">
        <EventCalendar
          events={events}
          courses={courses}
          onDayClick={handleDayClick}
        />
        {dayModalDate && (
          <DayModal
            date={dayModalDate}
            events={events}
            courses={courses}
            onClose={() => setDayModalDate(null)}
            onAdd={() => { setAddingToDate(dayModalDate); setDayModalDate(null); }}
            onEdit={(ev) => { setEditingEvent(ev); setDayModalDate(null); }}
            onDelete={(id) => { handleDeleteEvent(id); }}
          />
        )}
        {addingToDate && (
          <AddEventModal
            courses={courses}
            initialDate={addingToDate}
            onAddEvent={onAddEvent}
            onClose={() => setAddingToDate(null)}
          />
        )}
        {editingEvent && (
          <AddEventModal
            courses={courses}
            editingEvent={editingEvent}
            onEditEvent={handleEditEvent}
            onClose={() => setEditingEvent(null)}
          />
        )}
      </div>

      {recentDecks.length > 0 && (
        <div className="card">
          <p className="section-title">Recents</p>
          <div className="recents-grid">
            {recentDecks.map(deck => {
              const course = courseMap[deck.courseId];
              return (
                <div key={deck.id} className="recent-deck-card" onClick={() => onOpenDeck(deck)}>
                  <div className="recent-deck-icon" style={course ? { '--deck-icon-color': course.color } : {}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="15" height="13" rx="2"/>
                      <path d="M7 3h11a2 2 0 0 1 2 2v11"/>
                    </svg>
                  </div>
                  <div className="recent-deck-info">
                    <span className="recent-deck-name">{deck.name}</span>
                    <span className="recent-deck-meta">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}{course ? ` · ${course.name}` : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
