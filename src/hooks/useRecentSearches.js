import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recent_searches';
const MAX_SEARCHES = 5;

/**
 * Custom hook for managing recent search history
 */
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecentSearches(saved);
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
      setRecentSearches([]);
    }
  }, []);

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
