import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Sparkles, 
  Eye, 
  EyeOff, 
  MessageSquare 
} from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';
import MockChat from './MockChat';

/**
 * Expandable question card with strategy, answer, and mock interview mode
 */
export const QuestionCard = ({ q, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'practice'

  return (
    <div className="group relative mb-4">
      {/* Glow effect for dark mode */}
      {isDark && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg opacity-20 group-hover:opacity-100 transition duration-500 blur ${isOpen ? 'opacity-75' : ''}`} />
      )}
      
      <div className={`relative border rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-lg ${
        isDark 
          ? 'bg-slate-900/40 border-slate-700/50' 
          : 'bg-white/60 border-white/50 shadow-sm hover:shadow-md'
      }`}>
        {/* Question Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left p-5 flex justify-between items-start gap-4 transition-colors ${
            isDark ? 'hover:bg-slate-800/30' : 'hover:bg-white/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* Category Badge */}
              <span className={`inline-flex items-center px-2 py-1 text-xs font-mono rounded border backdrop-blur-md ${
                isDark 
                  ? 'text-cyan-400 bg-cyan-950/30 border-cyan-900/50' 
                  : 'text-cyan-700 bg-cyan-50/50 border-cyan-200/50'
              }`}>
                <Terminal className="w-3 h-3 mr-1" />
                {q.category}
              </span>
              
              {/* Difficulty Badge */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded border backdrop-blur-md ${
                q.difficulty === 'Senior'
                  ? (isDark ? 'border-red-900/50 text-red-400 bg-red-950/30' : 'border-red-200/50 text-red-700 bg-red-50/50')
                  : q.difficulty === 'Mid'
                  ? (isDark ? 'border-yellow-900/50 text-yellow-400 bg-yellow-950/30' : 'border-yellow-200/50 text-yellow-700 bg-yellow-50/50')
                  : (isDark ? 'border-green-900/50 text-green-400 bg-green-950/30' : 'border-green-200/50 text-green-700 bg-green-50/50')
              }`}>
                {q.difficulty}
              </span>
            </div>
            
            <h3 className={`text-lg font-medium transition-colors ${
              isDark 
                ? 'text-slate-200 group-hover:text-white' 
                : 'text-slate-800 group-hover:text-cyan-700'
            }`}>
              {q.q}
            </h3>
          </div>
          
          {isOpen 
            ? <ChevronUp className="w-5 h-5 text-cyan-500 mt-1" /> 
            : <ChevronDown className="w-5 h-5 text-slate-400 mt-1" />
          }
        </button>

        {/* Expanded Content */}
        {isOpen && (
          <div className={`p-5 border-t backdrop-blur-md ${
            isDark ? 'bg-slate-950/30 border-slate-800/30' : 'bg-slate-50/30 border-slate-100/50'
          }`}>
            {mode === 'view' ? (
              <>
                {/* Strategy Section */}
                <div className="flex gap-4 mb-6">
                  <div className="min-w-[24px] pt-1">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2">
                      Answer Strategy
                    </h4>
                    <p className={`leading-relaxed text-sm md:text-base font-light ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {renderMarkdown(q.strategy, isDark)}
                    </p>
                  </div>
                </div>

                {/* Model Answer Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 hover:text-emerald-400 transition-colors"
                  >
                    {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}
                  </button>

                  {showAnswer && (
                    <div className={`border rounded-lg p-4 animate-in fade-in slide-in-from-top-1 backdrop-blur-sm ${
                      isDark 
                        ? 'bg-emerald-950/20 border-emerald-900/30' 
                        : 'bg-emerald-50/50 border-emerald-200/50'
                    }`}>
                      <p className={`text-sm leading-relaxed italic ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        "{renderMarkdown(q.sample_answer, isDark)}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Practice Mode Button */}
                <button
                  onClick={() => setMode('practice')}
                  className={`w-full py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 active:scale-95 backdrop-blur-sm ${
                    isDark
                      ? 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50 text-cyan-400'
                      : 'bg-white/50 hover:bg-white/80 border-slate-200/50 text-cyan-700 shadow-sm'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Enter Mock Interview Mode
                </button>
              </>
            ) : (
              <MockChat
                question={q.q}
                idealAnswer={q.sample_answer}
                onBack={() => setMode('view')}
                isDark={isDark}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
