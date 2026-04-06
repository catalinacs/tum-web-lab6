import { useState, useRef } from 'react';

export default function CourseList({ courses, setCourses, setSelectedCourse, onRenameCourse }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef(null);

  if (!courses.length) {
    return <p className="empty-state">No courses yet. Add one above to get started.</p>;
  }

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const startRename = (course) => {
    setRenamingId(course.id);
    setRenameValue(course.name);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitRename = (id) => {
    const trimmed = renameValue.trim();
    if (trimmed) onRenameCourse?.(id, trimmed);
    setRenamingId(null);
  };

  return (
    <ul className="course-list">
      {courses.map((course) => (
        <li
          key={course.id}
          className="course-card"
          style={{ '--course-border': '#a8d8ea' }}
        >
          {renamingId === course.id ? (
            <input
              ref={inputRef}
              className="course-rename-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => commitRename(course.id)}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(course.id); if (e.key === 'Escape') setRenamingId(null); }}
            />
          ) : (
            <span className="course-name" onClick={() => startRename(course)} title="Click to rename" style={{ cursor: 'pointer' }}>
              {course.name}
            </span>
          )}
          <div className="course-actions">
            <button className="btn btn-primary course-study-now-btn" onClick={() => setSelectedCourse(course)}>
              Study Now
            </button>
            <button className="btn btn-danger course-delete-btn" onClick={() => handleDelete(course.id)} title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
