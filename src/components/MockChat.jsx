import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { evaluateAnswerStreaming } from '../services/ai';
import { renderMarkdown } from '../utils/markdown';

/**
 * Interactive mock interview chat component with streaming responses
 */
export const MockChat = ({ question, idealAnswer, onBack, isDark }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || evaluating) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setEvaluating(true);
    setStreamingContent('');

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Use streaming API
      const fullResponse = await evaluateAnswerStreaming(
        question,
        idealAnswer,
        userMsg,
        (chunk, fullContent) => {
          setStreamingContent(fullContent);
        },
        abortControllerRef.current.signal
      );

      // Add final message
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
      setStreamingContent('');
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Chat error:', e);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Error connecting to AI tutor. Please try again." 
        }]);
      }
      setStreamingContent('');
    } finally {
      setEvaluating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`border rounded-lg p-4 mt-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-md ${
      isDark 
        ? 'bg-slate-900/60 border-slate-700/50' 
        : 'bg-white/60 border-white/50 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 border-b pb-2 ${
        isDark ? 'border-slate-800/50' : 'border-slate-200/50'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-500 uppercase">Live Simulation</span>
          {evaluating && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Streaming
            </span>
          )}
        </div>
        <button 
          onClick={onBack} 
          className={`${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'} transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {messages.length === 0 && !streamingContent && (
          <div className={`text-sm italic text-center py-4 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Type your answer below to start...
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm backdrop-blur-sm ${
              m.role === 'user'
                ? (isDark 
                    ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-800/50' 
                    : 'bg-blue-100/80 text-blue-900 border border-blue-200/50')
                : (isDark 
                    ? 'bg-slate-800/60 text-slate-300' 
                    : 'bg-white/70 text-slate-700 border border-slate-200/50 shadow-sm')
            }`}>
              {renderMarkdown(m.content, isDark)}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className={`max-w-[85%] rounded-lg p-3 text-sm backdrop-blur-sm ${
              isDark 
                ? 'bg-slate-800/60 text-slate-300' 
                : 'bg-white/70 text-slate-700 border border-slate-200/50 shadow-sm'
            }`}>
              {renderMarkdown(streamingContent, isDark)}
              <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading indicator (fallback) */}
        {evaluating && !streamingContent && (
          <div className="flex justify-start">
            <div className={`rounded-lg p-3 backdrop-blur-sm ${
              isDark ? 'bg-slate-800/60' : 'bg-white/70 border border-slate-200/50 shadow-sm'
            }`}>
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          disabled={evaluating}
          className={`flex-1 border rounded-md px-3 py-2 text-sm focus:border-cyan-500 outline-none transition-all backdrop-blur-sm disabled:opacity-50 ${
            isDark 
              ? 'bg-slate-950/50 border-slate-700/50 text-white' 
              : 'bg-white/50 border-slate-300/50 text-slate-900 focus:bg-white/80'
          }`}
        />
        <button 
          onClick={handleSend} 
          disabled={evaluating || !input.trim()}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-md text-white transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MockChat;
