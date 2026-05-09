import { useState, useRef } from 'react';
import { fetchCourses } from '../api/client';

export default function CourseList({ courses, setCourses, setSelectedCourse, onRenameCourse }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await fetchCourses(100, 0);
      const existingNames = new Set(courses.map(c => c.name.toLowerCase()));
      const newCourses = result.data.filter(c => !existingNames.has(c.name.toLowerCase()));
      if (newCourses.length > 0) {
        setCourses(prev => [...prev, ...newCourses]);
      }
      setSyncMsg({ ok: true, text: `Synced ${newCourses.length} new course${newCourses.length !== 1 ? 's' : ''} from API` });
    } catch (err) {
      setSyncMsg({ ok: false, text: err.message });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };
  const inputRef = useRef(null);

  const syncLabel = syncing ? 'Syncing…' : 'Sync with API';

  if (!courses.length) {
    return (
      <>
        <p className="empty-state">No courses yet. Add one above to get started.</p>
        <div className="sync-bar">
          <button className="btn btn-primary sync-btn" onClick={handleSync} disabled={syncing}>
            {syncLabel}
          </button>
          {syncMsg && <span className={`sync-toast ${syncMsg.ok ? 'sync-toast--ok' : 'sync-toast--err'}`}>{syncMsg.text}</span>}
        </div>
      </>
    );
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
    <>
    <div className="sync-bar">
      <button className="btn btn-primary sync-btn" onClick={handleSync} disabled={syncing}>
        {syncLabel}
      </button>
      {syncMsg && <span className={`sync-toast ${syncMsg.ok ? 'sync-toast--ok' : 'sync-toast--err'}`}>{syncMsg.text}</span>}
    </div>
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
    </>
  );
}
