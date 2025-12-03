import React from 'react';
import { FileText } from 'lucide-react';

/**
 * Collapsible context input panel for resume/job description
 */
export const ContextPanel = ({ resumeText, setResumeText, isDark }) => {
  return (
    <div className={`backdrop-blur-xl border rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-2 ${
      isDark 
        ? 'bg-slate-900/60 border-purple-900/30' 
        : 'bg-white/60 border-purple-100/50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-purple-500" />
        <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Resume / Job Description Context
        </span>
      </div>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume summary here..."
        className={`w-full h-32 border rounded-lg p-4 text-sm focus:border-purple-500 outline-none resize-none backdrop-blur-sm ${
          isDark 
            ? 'bg-slate-950/50 border-slate-700 text-slate-300' 
            : 'bg-white/50 border-slate-200 text-slate-700 focus:bg-white/80'
        }`}
      />
    </div>
  );
};

export default ContextPanel;
