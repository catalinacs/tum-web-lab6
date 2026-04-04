import { useState } from 'react';

const EVENT_TYPES = ['Test', 'Quiz', 'Assignment', 'Deadline'];

export default function AddEventModal({ courses, initialDate, onAddEvent, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [date, setDate] = useState(initialDate ?? '');
  const [courseId, setCourseId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddEvent({
      title: trimmed,
      type,
      date,
      courseId: courseId || null,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: 24, minWidth: 320 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Add Event</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              style={{ display: 'block', width: '100%', marginBottom: 12 }}
            />
          </label>

          <label>
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 12 }}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ display: 'block', width: '100%', marginBottom: 12 }}
            />
          </label>

          <label>
            Course (optional)
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 16 }}
            >
              <option value="">None</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}
