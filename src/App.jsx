import { useState } from 'react';
import studySyncLogo from './assets/studysync-logo.png';
import { useLocalStorage } from './hooks/useLocalStorage';
import PomodoroTimer from './components/PomodoroTimer';
import CourseList from './components/CourseList';
import AddCourseForm from './components/AddCourseForm';
import SessionLog from './components/SessionLog';
import StatsPanel from './components/StatsPanel';
import EventCalendar from './components/EventCalendar';
import AddEventModal from './components/AddEventModal';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './components/Dashboard';
import FlashcardDecks from './components/FlashcardDecks';
import FlashcardEditor from './components/FlashcardEditor';
import FlashcardStudy from './components/FlashcardStudy';

const PASTEL_COLORS = ['#f4a7b9', '#a8c5a0', '#c3b1e1', '#ffcba4', '#a8d8ea', '#b5ead7', '#ffd97d', '#d4a5c9'];

const NAV_ITEMS = [
  { id: 'home',       label: 'Home' },
  { id: 'courses',    label: 'Courses' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'calendar',   label: 'Calendar' },
  { id: 'timer',      label: 'Timer' },
  { id: 'stats',      label: 'Stats' },
];

function App() {
  const [courses, setCourses]   = useLocalStorage('studysync_courses', []);
  const [sessions, setSessions] = useLocalStorage('studysync_sessions', []);
  const [events, setEvents]     = useLocalStorage('studysync_events', []);
  const [theme, setTheme]       = useLocalStorage('studysync_theme', 'light');
  const [decks, setDecks]                 = useLocalStorage('studysync_decks', []);
  const [activeView, setActiveView]       = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalDate, setModalDate]         = useState(null);
  const [studyingDeck, setStudyingDeck]   = useState(null);
  const [editingDeck, setEditingDeck]     = useState(null);

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

  const handleAddDeck = (name, courseId) => {
    setDecks((prev) => [...prev, { id: crypto.randomUUID(), name, courseId, cards: [] }]);
  };

  const handleDeleteDeck = (deckId) => {
    setDecks((prev) => prev.filter(d => d.id !== deckId));
    if (studyingDeck?.id === deckId) setStudyingDeck(null);
  };

  const handleAddCard = (deckId, question, answer) => {
    setDecks((prev) => prev.map(d =>
      d.id === deckId
        ? { ...d, cards: [...d.cards, { id: crypto.randomUUID(), question, answer }] }
        : d
    ));
  };

  const handleDeleteCard = (deckId, cardId) => {
    setDecks((prev) => prev.map(d =>
      d.id === deckId
        ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
        : d
    ));
  };

  const handleUpdateCard = (deckId, cardId, question, answer) => {
    setDecks((prev) => prev.map(d =>
      d.id === deckId
        ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, question, answer } : c) }
        : d
    ));
  };

  const handleReorderCards = (deckId, fromIndex, toIndex) => {
    setDecks((prev) => prev.map(d => {
      if (d.id !== deckId) return d;
      const cards = [...d.cards];
      const [moved] = cards.splice(fromIndex, 1);
      cards.splice(toIndex, 0, moved);
      return { ...d, cards };
    }));
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setActiveView('timer');
  };

  const sharedProps = {
    courses, setCourses,
    sessions, setSessions,
    events, setEvents,
    selectedCourse,
    setSelectedCourse: handleSelectCourse,
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard events={events} setEvents={setEvents} courses={courses} />;
      case 'flashcards':
        if (studyingDeck) {
          const liveStudyDeck = decks.find(d => d.id === studyingDeck.id) ?? studyingDeck;
          return <FlashcardStudy deck={liveStudyDeck} onBack={() => setStudyingDeck(null)} />;
        }
        if (editingDeck) {
          const liveEditDeck = decks.find(d => d.id === editingDeck.id) ?? editingDeck;
          return (
            <FlashcardEditor
              deck={liveEditDeck}
              onBack={() => setEditingDeck(null)}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
              onReorderCards={handleReorderCards}
              onStudy={(deck) => { setEditingDeck(null); setStudyingDeck(deck); }}
            />
          );
        }
        return (
          <FlashcardDecks
            decks={decks}
            courses={courses}
            onAddDeck={handleAddDeck}
            onDeleteDeck={handleDeleteDeck}
            onStudy={(deck) => setStudyingDeck(deck)}
            onEdit={(deck) => setEditingDeck(deck)}
          />
        );
      case 'timer':
        return <PomodoroTimer {...sharedProps} onSessionComplete={handleSessionComplete} />;
      case 'courses':
        return (
          <div className="courses-page">
            <div className="card">
              <p className="section-title">Add Course</p>
              <AddCourseForm onAddCourse={handleAddCourse} />
            </div>
            <div className="card">
              <p className="section-title">My Courses</p>
              <CourseList {...sharedProps} />
            </div>
            <div className="card">
              <p className="section-title">Session Log</p>
              <SessionLog {...sharedProps} />
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="card">
            <EventCalendar {...sharedProps} onDayClick={(date) => setModalDate(date)} />
            {modalDate && (
              <AddEventModal
                courses={courses}
                initialDate={modalDate}
                onAddEvent={handleAddEvent}
                onClose={() => setModalDate(null)}
              />
            )}
          </div>
        );
      case 'stats':
        return <StatsPanel {...sharedProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout" data-theme={theme}>
      <aside className="sidebar">
        <img src={studySyncLogo} alt="StudySync" className="sidebar-logo" />
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className="nav-btn"
              data-view={item.id}
              onClick={() => setActiveView(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </aside>
      <main className="main-content">{renderView()}</main>
    </div>
  );
}

export default App;
