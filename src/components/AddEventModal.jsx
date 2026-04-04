import { useState } from 'react';

const EVENT_TYPES = ['Test', 'Quiz', 'Assignment', 'Deadline'];

export default function AddEventModal({ courses, initialDate, onAddEvent, onClose }) {
  const [title,    setTitle]    = useState('');
  const [type,     setType]     = useState(EVENT_TYPES[0]);
  const [courseId, setCourseId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddEvent({ title: trimmed, type, date: initialDate, courseId: courseId || null });
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Add Event</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{initialDate}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="ev-title">Title</label>
            <input
              id="ev-title"
              type="text"
              className="input"
              style={{ borderRadius: 12 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="ev-type">Type</label>
            <select
              id="ev-type"
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="ev-course">Course (optional)</label>
            <select
              id="ev-course"
              className="select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">None</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}
