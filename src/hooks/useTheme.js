import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing theme state
 * @param {string} initialTheme - Initial theme ('light' or 'dark')
 */
export const useTheme = (initialTheme = 'light') => {
  const [theme, setTheme] = useState(initialTheme);

  const isDark = useMemo(() => theme === 'dark', [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, isDark, setTheme, toggleTheme };
};

export default useTheme;
