import { useState, useCallback } from 'react';

const STORAGE_KEY = 'recent_searches';
const MAX_SEARCHES = 5;

/**
 * Load recent searches from localStorage
 */
const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * Custom hook for managing recent search history
 */
export const useRecentSearches = () => {
  // Use lazy initialization to load from localStorage
  const [recentSearches, setRecentSearches] = useState(loadFromStorage);

  // Add a new search to history
  const addToHistory = useCallback((url) => {
    setRecentSearches(prev => {
      const newHistory = [url, ...prev.filter(u => u !== url)].slice(0, MAX_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  }, []);

  return { recentSearches, addToHistory, clearHistory };
};

export default useRecentSearches;
