import { useEffect, useState } from 'react';

const Dark = () => {
  const storageKey = 'theme';
  const [isDark, setIsDark] = useState(false);

  const applyTheme = (theme) => {
    document.querySelector('body')?.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark' || saved === 'light') {
      setIsDark(saved === 'dark');
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    applyTheme(prefersDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    applyTheme(next);
    localStorage.setItem(storageKey, next);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn btn-ghost btn-circle"
      style={{
        width: '40px',
        height: '40px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        display: 'grid',
        placeItems: 'center',
        transition: 'transform 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      title={isDark ? 'Dark mode' : 'Light mode'}
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
};

export default Dark;
