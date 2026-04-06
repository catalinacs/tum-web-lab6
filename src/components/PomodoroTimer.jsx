import { useRef, useEffect } from 'react';

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return [m, s];
}

export default function PomodoroTimer({
  selectedCourse,
  workMinutes, breakSeconds,
  mode, timeLeft, isRunning, setIsRunning,
  sessionsCount, chimeCount,
  onReset, onDurationChange,
}) {
  const fullTime = mode === 'work' ? workMinutes * 60 : breakSeconds;
  const audioCtxRef  = useRef(null);
  const keepAliveRef = useRef(null); // silent oscillator that keeps AudioContext warm

  const startKeepAlive = (ctx) => {
    if (keepAliveRef.current) return; // already running
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0; // completely silent
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    keepAliveRef.current = osc;
  };

  const stopKeepAlive = () => {
    if (keepAliveRef.current) {
      try { keepAliveRef.current.stop(); } catch {}
      keepAliveRef.current = null;
    }
  };

  const scheduleNotes = (ctx) => {
    const notes   = [523, 659, 784, 1047, 784, 1047, 1319];
    const noteLen = 0.45;
    const now     = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type           = 'sine';
      osc.frequency.value = freq;
      const t0 = now + i * noteLen;
      const t1 = t0 + noteLen * 0.85;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.7, t0 + 0.02);
      gain.gain.linearRampToValueAtTime(0, t1);
      osc.start(t0);
      osc.stop(t1 + 0.05);
    });
  };

  const playChime = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // Context should already be running (kept warm by silent oscillator),
    // but resume just in case.
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => scheduleNotes(ctx));
    } else {
      scheduleNotes(ctx);
    }
    stopKeepAlive(); // no longer needed after chime
  };

  // Start/stop the keep-alive oscillator in sync with isRunning
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (isRunning) {
      startKeepAlive(ctx);
    } else {
      stopKeepAlive();
    }
  }, [isRunning]);

  // Play chime only when App.jsx signals a completed work session
  useEffect(() => {
    if (chimeCount > 0) playChime();
  }, [chimeCount]);

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
            if (!isNaN(val)) onDurationChange(val);
          }}
        />
        <span>min</span>
      </div>

      <div className="timer-body">
        <div className="timer-circle">
          <span className="timer-mode-label">{mode === 'work' ? 'Work' : 'Break'}</span>
          <span className="timer-time">
            <span>{formatTime(timeLeft)[0]}</span><span className="timer-colon">:</span><span>{formatTime(timeLeft)[1]}</span>
          </span>
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
          <button className="btn-timer-primary" onClick={() => {
            if (!isRunning) {
              if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
              } else if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
              }
            }
            setIsRunning(!isRunning);
          }}>
            {isRunning ? 'Pause' : timeLeft === fullTime ? 'Start' : 'Continue'}
          </button>
          <button className="btn btn-ghost" onClick={onReset}>Reset</button>
        </div>

        <p className="timer-sessions">Sessions completed: {sessionsCount}</p>
      </div>
    </div>
  );
}
