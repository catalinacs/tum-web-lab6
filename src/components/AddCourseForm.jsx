import { useState } from 'react';

export default function AddCourseForm({ onAddCourse }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddCourse(trimmed);
    setName('');
  };

  return (
    <form className="add-course-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Course name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">Add</button>
    </form>
  );
}
