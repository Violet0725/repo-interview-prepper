import React from 'react';

/**
 * Render simple markdown (bold and code) to React elements
 * @param {string} text - Text with markdown formatting
 * @param {boolean} isDark - Whether dark mode is active
 */
export const renderMarkdown = (text, isDark) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong 
          key={i} 
          className={isDark ? "text-cyan-300 font-bold" : "text-cyan-700 font-bold"}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={i} 
          className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs ${
            isDark 
              ? "bg-slate-800 text-cyan-300 border border-slate-700" 
              : "bg-slate-100 text-cyan-600 border border-slate-200"
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export default renderMarkdown;
