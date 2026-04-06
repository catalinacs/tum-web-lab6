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

  const audioCtxRef = useRef(null);

  // Called on Start click (user gesture) — resumes AudioContext silently, no sound
  const unlockChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      audioCtxRef.current.resume();
    } catch {}
  };

  const playChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const notes = [523, 659, 784, 659, 784, 1047, 784, 659, 523, 659, 784, 1047];
      const noteDuration = 0.5;
      const gap = 0.05;

      const doPlay = () => {
        // Compressor keeps it loud without clipping
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -6;
        compressor.knee.value = 3;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.001;
        compressor.release.value = 0.1;
        compressor.connect(ctx.destination);

        notes.forEach((freq, i) => {
          const start = ctx.currentTime + 0.05 + i * (noteDuration + gap);
          const end   = start + noteDuration;

          // Primary sine tone
          const osc1  = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, start);
          gain1.gain.setValueAtTime(0, start);
          gain1.gain.linearRampToValueAtTime(0.9, start + 0.015);
          gain1.gain.exponentialRampToValueAtTime(0.001, end);
          osc1.connect(gain1);
          gain1.connect(compressor);
          osc1.start(start);
          osc1.stop(end);

          // Subtle overtone (one octave up) for brightness
          const osc2  = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq * 2, start);
          gain2.gain.setValueAtTime(0, start);
          gain2.gain.linearRampToValueAtTime(0.25, start + 0.015);
          gain2.gain.exponentialRampToValueAtTime(0.001, end);
          osc2.connect(gain2);
          gain2.connect(compressor);
          osc2.start(start);
          osc2.stop(end);
        });
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(doPlay);
      } else {
        doPlay();
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
