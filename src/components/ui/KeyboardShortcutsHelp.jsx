import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'Enter'], description: 'Submit / Scan repository' },
  { keys: ['Ctrl', 'K'], description: 'Focus search input' },
  { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle dark/light mode' },
  { keys: ['Esc'], description: 'Close modal / Go back' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];

/**
 * Keyboard shortcut key badge
 */
const KeyBadge = ({ children, isDark }) => (
  <kbd
    className={`px-2 py-1 text-xs font-mono rounded border ${
      isDark
        ? 'bg-slate-800 border-slate-700 text-slate-300'
        : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}
  >
    {children}
  </kbd>
);

/**
 * Keyboard shortcuts help modal
 */
export const KeyboardShortcutsHelp = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key to open help
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 p-2 rounded-full border backdrop-blur-md transition-all hover:scale-110 ${
          isDark
            ? 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            : 'bg-white/80 border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
        }`}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div
            className={`relative w-full max-w-md rounded-xl border shadow-2xl animate-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-slate-900 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h2
                id="shortcuts-title"
                className={`text-lg font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Keyboard className="w-5 h-5 text-cyan-500" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded hover:bg-slate-500/20 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <span className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <KeyBadge isDark={isDark}>{key}</KeyBadge>
                        {i < shortcut.keys.length - 1 && (
                          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`px-4 py-3 text-xs text-center border-t ${
              isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              Press <KeyBadge isDark={isDark}>?</KeyBadge> anytime to show this help
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;
