import { useEffect, useCallback } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target;
      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      // Build the key combination string
      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('mod');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      keys.push(event.key.toLowerCase());
      
      const combo = keys.join('+');

      // Check for matching shortcut
      const handler = shortcuts[combo];
      
      if (handler) {
        // Some shortcuts should work even in inputs
        const allowInInput = handler.allowInInput || false;
        
        if (!isInput || allowInInput) {
          event.preventDefault();
          if (typeof handler === 'function') {
            handler(event);
          } else if (handler.action) {
            handler.action(event);
          }
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Common keyboard shortcut configurations
 */
export const SHORTCUTS = {
  SUBMIT: 'mod+enter',
  ESCAPE: 'escape',
  TOGGLE_THEME: 'mod+shift+l',
  FOCUS_SEARCH: 'mod+k',
  NEXT_STEP: 'mod+]',
  PREV_STEP: 'mod+[',
};

export default useKeyboardShortcuts;
