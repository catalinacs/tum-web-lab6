export default function CourseList({ courses, setCourses, setSelectedCourse }) {
  if (!courses.length) {
    return <p className="empty-state">No courses yet. Add one above to get started.</p>;
  }

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ul className="course-list">
      {courses.map((course) => (
        <li
          key={course.id}
          className="course-card"
          style={{ borderLeftColor: course.color }}
        >
          <span className="course-dot" style={{ backgroundColor: course.color }} />
          <span className="course-name">{course.name}</span>
          <div className="course-actions">
            <button className="btn btn-primary" onClick={() => setSelectedCourse(course)}>
              Study Now
            </button>
            <button className="btn btn-danger" onClick={() => handleDelete(course.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
