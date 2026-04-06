import { useState, useEffect, useRef } from 'react';
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
  const VALID_VIEWS = NAV_ITEMS.map(i => i.id);
  const getHashView = () => {
    const hash = window.location.hash.replace('#', '');
    return VALID_VIEWS.includes(hash) ? hash : 'home';
  };
  const [activeView, setActiveViewState] = useState(getHashView);
  const setActiveView = (view) => {
    window.location.hash = view;
    setActiveViewState(view);
  };
  useEffect(() => {
    const onHashChange = () => setActiveViewState(getHashView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalDate, setModalDate]         = useState(null);
  const [studyingDeck, setStudyingDeck]   = useState(null);
  const [editingDeck, setEditingDeck]     = useState(null);

  // Timer state lifted here so it keeps running across page switches
  const BREAK_SECONDS = 5 * 60;
  const [timerWorkMinutes, setTimerWorkMinutes] = useState(25);
  const [timerMode, setTimerMode]               = useState('work');
  const [timerTimeLeft, setTimerTimeLeft]       = useState(25 * 60);
  const [timerRunning, setTimerRunning]         = useState(false);
  const [timerSessions, setTimerSessions]       = useState(0);
  const timerModeRef = useRef(timerMode);
  timerModeRef.current = timerMode;
  const timerWorkMinutesRef = useRef(timerWorkMinutes);
  timerWorkMinutesRef.current = timerWorkMinutes;
  const selectedCourseRef = useRef(selectedCourse);
  selectedCourseRef.current = selectedCourse;

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {}
  };

  const handleTimerExpire = () => {
    playChime();
    if (timerModeRef.current === 'work') {
      handleSessionComplete(selectedCourseRef.current, timerWorkMinutesRef.current);
      setTimerSessions(n => n + 1);
      setTimerMode('break');
      setTimerTimeLeft(BREAK_SECONDS);
    } else {
      setTimerMode('work');
      setTimerTimeLeft(timerWorkMinutesRef.current * 60);
    }
    setTimerRunning(false);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          handleTimerExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

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
        return (
          <PomodoroTimer
            selectedCourse={selectedCourse}
            workMinutes={timerWorkMinutes}
            setWorkMinutes={setTimerWorkMinutes}
            mode={timerMode}
            timeLeft={timerTimeLeft}
            isRunning={timerRunning}
            setIsRunning={setTimerRunning}
            sessionsCount={timerSessions}
            onReset={() => setTimerTimeLeft(timerMode === 'work' ? timerWorkMinutes * 60 : BREAK_SECONDS)}
            onSkip={() => {
              setTimerRunning(false);
              if (timerMode === 'work') { setTimerMode('break'); setTimerTimeLeft(BREAK_SECONDS); }
              else { setTimerMode('work'); setTimerTimeLeft(timerWorkMinutes * 60); }
            }}
            onDurationChange={(min) => {
              setTimerWorkMinutes(min);
              setTimerRunning(false);
              setTimerMode('work');
              setTimerTimeLeft(min * 60);
            }}
          />
        );
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
              onClick={() => setActiveView(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </aside>

      <div className="mobile-top-bar">
        <img src={studySyncLogo} alt="StudySync" className="mobile-logo" />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <main className="main-content">{renderView()}</main>

      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="mobile-nav-btn"
            onClick={() => setActiveView(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
