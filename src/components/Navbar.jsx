import React from 'react';
import { Github, User, Sun, Moon, Cpu, Zap } from 'lucide-react';

/**
 * Navigation bar component
 */
export const Navbar = ({ 
  isDark, 
  showContextInput, 
  setShowContextInput, 
  toggleTheme 
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-lg backdrop-blur-md ${
          isDark 
            ? 'bg-slate-900/60 border-slate-700/50 shadow-cyan-500/10' 
            : 'bg-white/60 border-white/50 shadow-slate-200/50'
        }`}>
          <Github className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        </div>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Repo Interview <span className="text-cyan-500">Prepper</span>
          </h1>
          <div className="flex gap-2 text-xs text-slate-500 font-mono mt-1">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> v2.7.0</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-Enhanced</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {/* Context Toggle */}
        <button
          onClick={() => setShowContextInput(!showContextInput)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md active:scale-95 ${
            showContextInput
              ? (isDark 
                  ? 'bg-slate-800/80 border-purple-500/50 text-purple-400' 
                  : 'bg-purple-50/80 border-purple-200 text-purple-700')
              : (isDark 
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600' 
                  : 'bg-white/60 border-white/50 text-slate-500 hover:border-slate-300 shadow-sm')
          }`}
        >
          <User className="w-3 h-3" /> Context
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all backdrop-blur-md active:scale-95 ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-yellow-400 hover:text-yellow-300'
              : 'bg-white/60 border-white/50 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
