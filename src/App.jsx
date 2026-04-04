import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PomodoroTimer from './components/PomodoroTimer';
import CourseList from './components/CourseList';
import AddCourseForm from './components/AddCourseForm';
import SessionLog from './components/SessionLog';
import StatsPanel from './components/StatsPanel';
import EventCalendar from './components/EventCalendar';
import AddEventModal from './components/AddEventModal';
import ThemeToggle from './components/ThemeToggle';

const PASTEL_COLORS = ['#f4a7b9', '#a8c5a0', '#c3b1e1', '#ffcba4', '#a8d8ea', '#b5ead7', '#ffd97d', '#d4a5c9'];

const NAV_ITEMS = [
  { id: 'timer', label: 'Timer' },
  { id: 'courses', label: 'Courses' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'stats', label: 'Stats' },
];

function App() {
  const [courses, setCourses] = useLocalStorage('studysync_courses', []);
  const [sessions, setSessions] = useLocalStorage('studysync_sessions', []);
  const [events, setEvents] = useLocalStorage('studysync_events', []);
  const [theme, setTheme] = useLocalStorage('studysync_theme', 'light');
  const [activeView, setActiveView] = useState('timer');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalDate, setModalDate] = useState(null);

  const handleAddCourse = (name) => {
    const color = PASTEL_COLORS[courses.length % PASTEL_COLORS.length];
    setCourses((prev) => [...prev, { id: crypto.randomUUID(), name, color }]);
  };

  const handleSessionComplete = (course, duration) => {
    setSessions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        courseId: course?.id ?? null,
        duration,
        completedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleAddEvent = (event) => {
    setEvents((prev) => [...prev, { id: crypto.randomUUID(), ...event }]);
  };

  const sharedProps = {
    courses,
    setCourses,
    sessions,
    setSessions,
    events,
    setEvents,
    selectedCourse,
    setSelectedCourse,
  };

  const renderView = () => {
    switch (activeView) {
      case 'timer':
        return <PomodoroTimer {...sharedProps} onSessionComplete={handleSessionComplete} />;
      case 'courses':
        return (
          <>
            <AddCourseForm onAddCourse={handleAddCourse} />
            <CourseList {...sharedProps} />
            <SessionLog {...sharedProps} />
          </>
        );
      case 'calendar':
        return (
          <>
            <EventCalendar {...sharedProps} onDayClick={(date) => setModalDate(date)} />
            {modalDate && (
              <AddEventModal
                courses={courses}
                initialDate={modalDate}
                onAddEvent={handleAddEvent}
                onClose={() => setModalDate(null)}
              />
            )}
          </>
        );
      case 'stats':
        return <StatsPanel {...sharedProps} />;
      default:
        return null;
    }
  };

  return (
    <div data-theme={theme}>
      <aside>
        <h1>StudySync</h1>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </aside>
      <main>{renderView()}</main>
    </div>
  );
}

export default App;
