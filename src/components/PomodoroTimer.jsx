import { useState, useEffect, useRef } from 'react';

const DEFAULT_WORK_MINUTES = 25;
const BREAK_SECONDS = 5 * 60;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function Timer({ selectedCourse, onSessionComplete }) {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [mode, setMode]               = useState('work');
  const [timeLeft, setTimeLeft]       = useState(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning]     = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const workMinutesRef = useRef(workMinutes);
  workMinutesRef.current = workMinutes;

  const handleExpire = () => {
    if (modeRef.current === 'work') {
      onSessionComplete(selectedCourse, workMinutesRef.current);
      setSessionsCount((n) => n + 1);
      setMode('break');
      setTimeLeft(BREAK_SECONDS);
    } else {
      setMode('work');
      setTimeLeft(workMinutesRef.current * 60);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const handleDurationChange = (minutes) => {
    setWorkMinutes(minutes);
    setIsRunning(false);
    setMode('work');
    setTimeLeft(minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : BREAK_SECONDS);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(BREAK_SECONDS);
    } else {
      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  return (
    <div className="timer-page">
      <div className="timer-duration-row">
        <label htmlFor="timer-duration">Duration</label>
        <input
          id="timer-duration"
          type="number"
          className="timer-duration-input"
          min={1}
          max={180}
          value={workMinutes}
          disabled={isRunning}
          onChange={(e) => {
            const val = Math.max(1, Math.min(180, Number(e.target.value)));
            if (!isNaN(val)) handleDurationChange(val);
          }}
        />
        <span>min</span>
      </div>

      <div className="timer-circle">
        <span className="timer-mode-label">{mode === 'work' ? 'Work' : 'Break'}</span>
        <span className="timer-time">{formatTime(timeLeft)}</span>
        {selectedCourse ? (
          <span className="timer-course">
            <span className="timer-dot" style={{ backgroundColor: selectedCourse.color }} />
            {selectedCourse.name}
          </span>
        ) : (
          <span className="timer-course">No course selected</span>
        )}
      </div>

      <div className="timer-controls">
        <button className="btn-timer-primary" onClick={() => setIsRunning((r) => !r)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
        <button className="btn btn-ghost" onClick={handleSkip}>Skip</button>
      </div>

      <p className="timer-sessions">Sessions completed: {sessionsCount}</p>
    </div>
  );
}
