import React from 'react';
import { 
  ChevronDown, 
  Download, 
  FileText, 
  Cpu, 
  Zap 
} from 'lucide-react';
import QuestionCard from './QuestionCard';

/**
 * Results dashboard showing generated interview content
 */
export const ResultsDashboard = ({
  interviewData,
  repoData,
  questionType,
  onBack,
  onDownload,
  isDark
}) => {
  if (!interviewData) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className={`text-sm flex items-center gap-1 ${
            isDark ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'
          }`}
        >
          <ChevronDown className="w-4 h-4 rotate-90" /> Back to Files
        </button>
        <button
          onClick={onDownload}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors backdrop-blur-md active:scale-95 ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
              : 'bg-white/60 hover:bg-white/80 border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          <Download className="w-4 h-4" /> Download Brief
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Executive Summary */}
        <div className={`col-span-2 p-6 border rounded-2xl backdrop-blur-xl ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-white/50 shadow-sm'
        }`}>
          <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Executive Summary
          </h3>
          <p className={`leading-relaxed text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {interviewData.project_summary}
          </p>
        </div>

        {/* Tech Stack */}
        <div className={`p-6 border rounded-2xl backdrop-blur-xl ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-white/50 shadow-sm'
        }`}>
          <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {interviewData.tech_stack?.map((t, i) => (
              <span
                key={i}
                className={`px-2 py-1 border rounded text-xs ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-slate-100/80 border-slate-200 text-slate-600'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div>
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <Zap className="w-5 h-5 text-yellow-500" /> Interview Simulation
          <span className={`text-sm font-normal ml-2 border px-2 py-0.5 rounded-full capitalize ${
            isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200'
          }`}>
            {questionType} Mode
          </span>
        </h2>
        {interviewData.questions?.map((q, idx) => (
          <QuestionCard key={idx} q={q} isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

export default ResultsDashboard;
