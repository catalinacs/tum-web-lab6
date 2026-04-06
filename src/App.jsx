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

  const chimeAudioRef = useRef(null);

  const buildChimeDataUrl = () => {
    const sampleRate = 22050;
    const notes      = [523, 659, 784, 659, 784, 1047, 784, 659, 523, 659, 784, 1047];
    const noteLen    = 0.5;
    const duration   = notes.length * noteLen;
    const numSamples = Math.floor(sampleRate * duration);
    const buf  = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buf);
    const ws   = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true);
    ws(8, 'WAVE'); ws(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    ws(36, 'data'); view.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
      const t   = i / sampleRate;
      const ni  = Math.min(Math.floor(t / noteLen), notes.length - 1);
      const lt  = t - ni * noteLen;
      const env = Math.min(lt / 0.01, 1) * Math.min((noteLen - lt) / 0.08, 1);
      const s   = Math.sin(2 * Math.PI * notes[ni] * t) * 32767 * 0.9 * env;
      view.setInt16(44 + i * 2, Math.round(s), true);
    }
    const bytes = new Uint8Array(buf);
    const CHUNK = 8192;
    let bin = '';
    for (let i = 0; i < bytes.length; i += CHUNK)
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    return 'data:audio/wav;base64,' + btoa(bin);
  };

  // Called on Start click (user gesture) — unlocks the Audio element for later use
  const unlockChime = () => {
    try {
      if (!chimeAudioRef.current) {
        chimeAudioRef.current = new Audio(buildChimeDataUrl());
        chimeAudioRef.current.volume = 1.0;
      }
      const p = chimeAudioRef.current.play();
      if (p) p.then(() => { chimeAudioRef.current.pause(); chimeAudioRef.current.currentTime = 0; }).catch(() => {});
    } catch {}
  };

  const playChime = () => {
    try {
      if (chimeAudioRef.current) {
        chimeAudioRef.current.currentTime = 0;
        chimeAudioRef.current.play().catch(() => {});
      } else {
        // fallback if unlock was never called
        const audio = new Audio(buildChimeDataUrl());
        audio.volume = 1.0;
        audio.play().catch(() => {});
      }
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

  const timerTimeLeftRef = useRef(timerTimeLeft);
  timerTimeLeftRef.current = timerTimeLeft;

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      const next = timerTimeLeftRef.current - 1;
      if (next <= 0) {
        clearInterval(id);
        setTimerTimeLeft(0);
        handleTimerExpire();
      } else {
        timerTimeLeftRef.current = next;
        setTimerTimeLeft(next);
      }
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
            setWorkMinutes={setTimerWorkMinutes}
            mode={timerMode}
            timeLeft={timerTimeLeft}
            isRunning={timerRunning}
            setIsRunning={(v) => { if (v) unlockChime(); setTimerRunning(v); }}
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
