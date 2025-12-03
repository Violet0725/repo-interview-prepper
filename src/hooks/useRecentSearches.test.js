import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from './useRecentSearches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('[]');
  });

  it('should initialize with empty array when no saved searches', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual([]);
  });

  it('should load saved searches from localStorage', () => {
    const savedSearches = ['https://github.com/user/repo1', 'https://github.com/user/repo2'];
    localStorage.getItem.mockReturnValue(JSON.stringify(savedSearches));

    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual(savedSearches);
  });

  it('should add a new search to history', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addToHistory('https://github.com/user/repo');
    });

    expect(result.current.recentSearches).toContain('https://github.com/user/repo');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should move duplicate to front instead of adding twice', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([
      'https://github.com/user/repo1',
      'https://github.com/user/repo2'
    ]));

    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addToHistory('https://github.com/user/repo2');
    });

    expect(result.current.recentSearches[0]).toBe('https://github.com/user/repo2');
    expect(result.current.recentSearches.filter(u => u === 'https://github.com/user/repo2').length).toBe(1);
  });

  it('should limit history to 5 items', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addToHistory(`https://github.com/user/repo${i}`);
      }
    });

    expect(result.current.recentSearches.length).toBeLessThanOrEqual(5);
  });

  it('should clear history', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify(['https://github.com/user/repo']));

    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.recentSearches).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
});
