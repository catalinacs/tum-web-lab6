export default function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className="theme-toggle">
      <button
        className="theme-toggle-btn"
        aria-pressed={isDark}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle dark mode"
      >
        <span className="theme-toggle-thumb" />
      </button>
    </div>
  );
}
