import { useState, useEffect, useRef } from 'react';
import studySyncLogo from './assets/studysync-logo.png';
import { useLocalStorage } from './hooks/useLocalStorage';
import PomodoroTimer from './components/PomodoroTimer';
import StatsPanel from './components/StatsPanel';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './components/Dashboard';
import FlashcardEditor from './components/FlashcardEditor';
import FlashcardStudy from './components/FlashcardStudy';
import Library from './components/Library';

const PASTEL_COLORS = ['#f4a7b9', '#a8c5a0', '#c3b1e1', '#ffcba4', '#a8d8ea', '#b5ead7', '#ffd97d', '#d4a5c9'];

const NAV_ITEMS = [
  { id: 'home',    label: 'Home' },
  { id: 'library', label: 'Your Library' },
  { id: 'timer',   label: 'Timer' },
  { id: 'stats',   label: 'Stats' },
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
  const [menuOpen, setMenuOpen]           = useState(false);

  // Timer state lifted here so it keeps running across page switches
  const BREAK_SECONDS = 5 * 60;
  const [timerWorkMinutes, setTimerWorkMinutes] = useLocalStorage('studysync_timer_duration', 25);
  const [timerMode, setTimerMode]               = useState('work');
  const [timerTimeLeft, setTimerTimeLeft]       = useState(timerWorkMinutes * 60);
  const [timerRunning, setTimerRunning]         = useState(false);
  const [timerSessions, setTimerSessions]       = useState(0);
  const timerModeRef = useRef(timerMode);
  timerModeRef.current = timerMode;
  const timerWorkMinutesRef = useRef(timerWorkMinutes);
  timerWorkMinutesRef.current = timerWorkMinutes;
  const selectedCourseRef = useRef(selectedCourse);
  selectedCourseRef.current = selectedCourse;

  const handleTimerExpire = () => {
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

  const timerTimeLeftRef = useRef(timerTimeLeft);
  timerTimeLeftRef.current = timerTimeLeft;

  // Count down — just decrement, stop at 0
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      const next = timerTimeLeftRef.current - 1;
      timerTimeLeftRef.current = Math.max(0, next);
      setTimerTimeLeft(Math.max(0, next));
      if (next <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Handle expiry — fires after the render where timerTimeLeft becomes 0
  useEffect(() => {
    if (timerTimeLeft === 0 && timerRunning) {
      handleTimerExpire();
    }
  }, [timerTimeLeft]);

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
        return (
          <Dashboard
            events={events}
            setEvents={setEvents}
            courses={courses}
            decks={decks}
            onOpenDeck={(deck) => { setActiveView('library'); setEditingDeck(deck); }}
            onStudyDeck={(deck) => { setActiveView('library'); setStudyingDeck(deck); }}
            onAddEvent={handleAddEvent}
            modalDate={modalDate}
            setModalDate={setModalDate}
          />
        );
      case 'library':
        if (studyingDeck) {
          const liveStudyDeck = decks.find(d => d.id === studyingDeck.id) ?? studyingDeck;
          return <FlashcardStudy deck={liveStudyDeck} onBack={() => setStudyingDeck(null)} />;
        }
        if (editingDeck) {
          const liveEditDeck = decks.find(d => d.id === editingDeck.id) ?? editingDeck;
          return (
            <FlashcardEditor
              deck={liveEditDeck}
              courses={courses}
              onBack={() => setEditingDeck(null)}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
              onReorderCards={handleReorderCards}
              onRenameDeck={(id, name) => setDecks(prev => prev.map(d => d.id === id ? { ...d, name } : d))}
              onAssignCourse={(id, courseId) => setDecks(prev => prev.map(d => d.id === id ? { ...d, courseId } : d))}
              onStudy={(deck) => { setEditingDeck(null); setStudyingDeck(deck); }}
            />
          );
        }
        return (
          <Library
            decks={decks}
            courses={courses}
            sessions={sessions}
            onAddDeck={handleAddDeck}
            onDeleteDeck={handleDeleteDeck}
            onStudy={(deck) => setStudyingDeck(deck)}
            onEdit={(deck) => setEditingDeck(deck)}
            onAddCourse={handleAddCourse}
            onDeleteCourse={(id) => setCourses(prev => prev.filter(c => c.id !== id))}
            onRenameCourse={(id, name) => setCourses(prev => prev.map(c => c.id === id ? { ...c, name } : c))}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'timer':
        return (
          <PomodoroTimer
            selectedCourse={selectedCourse}
            workMinutes={timerWorkMinutes}
            breakSeconds={BREAK_SECONDS}
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
        <div className="mobile-top-bar-actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={`hamburger-icon${menuOpen ? ' open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-hamburger-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-hamburger-menu" onClick={e => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="hamburger-nav-btn"
                aria-current={activeView === item.id ? 'page' : undefined}
                onClick={() => { setActiveView(item.id); setMenuOpen(false); }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="main-content">{renderView()}</main>
    </div>
  );
}

export default App;
