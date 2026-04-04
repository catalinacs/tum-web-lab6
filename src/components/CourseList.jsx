export default function CourseList({ courses, setCourses, setSelectedCourse }) {
  if (!courses.length) {
    return <p>No courses yet. Add one above to get started.</p>;
  }

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ul>
      {courses.map((course) => (
        <li
          key={course.id}
          style={{ borderLeft: `4px solid ${course.color}`, paddingLeft: 12 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: course.color,
              marginRight: 8,
            }}
          />
          <span>{course.name}</span>
          <button onClick={() => setSelectedCourse(course)}>Study Now</button>
          <button onClick={() => handleDelete(course.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
