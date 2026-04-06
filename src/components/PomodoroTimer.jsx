function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return [m, s];
}

export default function PomodoroTimer({
  selectedCourse,
  workMinutes, setWorkMinutes,
  mode, timeLeft, isRunning, setIsRunning,
  sessionsCount,
  onReset, onSkip, onDurationChange,
}) {
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
            {formatTime(timeLeft)[0]}<span className="timer-colon">:</span>{formatTime(timeLeft)[1]}
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
          <button className="btn-timer-primary" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? 'Pause' : timeLeft === workMinutes * 60 && mode === 'work' ? 'Start' : 'Continue'}
          </button>
          <button className="btn btn-ghost" onClick={onReset}>Reset</button>
          <button className="btn btn-ghost" onClick={onSkip}>Skip</button>
        </div>

        <p className="timer-sessions">Sessions completed: {sessionsCount}</p>
      </div>
    </div>
  );
}
