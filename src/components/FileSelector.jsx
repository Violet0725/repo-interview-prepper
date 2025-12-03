import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Brain, 
  Loader2,
  Terminal,
  Briefcase,
  Layers
} from 'lucide-react';

/**
 * File selection component for choosing files to analyze
 */
export const FileSelector = ({
  fileTree,
  selectedFiles,
  setSelectedFiles,
  questionType,
  setQuestionType,
  error,
  loading,
  onAnalyze,
  onCancel,
  isDark
}) => {
  const toggleFile = (file) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter(f => f !== file));
    } else if (selectedFiles.length < 3) {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className={`border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/70 border-white/50'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div>
            <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Deep Dive Selection
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select critical files to include in the AI analysis context.
            </p>
          </div>
          <div className={`text-xs font-mono px-2 py-1 rounded border backdrop-blur-md ${
            isDark 
              ? 'bg-cyan-950/50 text-cyan-400 border-cyan-900' 
              : 'bg-cyan-50/50 text-cyan-700 border-cyan-200'
          }`}>
            {selectedFiles.length} Selected
          </div>
        </div>

        {/* File List */}
        <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
          {fileTree.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">
              No readable files found in root.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {fileTree.map(file => (
                <button
                  key={file}
                  onClick={() => toggleFile(file)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all border backdrop-blur-sm ${
                    selectedFiles.includes(file)
                      ? (isDark 
                          ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-100' 
                          : 'bg-cyan-50/80 border-cyan-200 text-cyan-800 shadow-sm')
                      : (isDark 
                          ? 'bg-slate-950/30 border-slate-800/50 text-slate-400 hover:bg-slate-800/50' 
                          : 'bg-white/40 border-slate-100 text-slate-600 hover:bg-white/60')
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedFiles.includes(file) 
                      ? 'border-cyan-500 bg-cyan-500' 
                      : (isDark ? 'border-slate-600' : 'border-slate-300')
                  }`}>
                    {selectedFiles.includes(file) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-mono text-sm truncate">{file}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className={`mx-6 mt-4 p-3 border rounded-lg text-xs flex items-center gap-2 ${
            isDark 
              ? 'bg-red-950/30 border-red-900/50 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Selection & Actions */}
        <div className={`px-6 py-4 border-t flex flex-col md:flex-row gap-4 justify-between items-center ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-100'
        }`}>
          {/* Question Type Toggle */}
          <div className={`flex p-1 rounded-lg border backdrop-blur-sm ${
            isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'
          }`}>
            {[
              { id: 'mixed', label: 'Mixed', icon: Layers },
              { id: 'technical', label: 'Technical', icon: Terminal },
              { id: 'behavioral', label: 'Behavioral', icon: Briefcase }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setQuestionType(m.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  questionType === m.id
                    ? (isDark ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-900 shadow')
                    : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                }`}
              >
                <m.icon className="w-3 h-3" /> {m.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`px-4 py-2 text-sm ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onAnalyze}
              disabled={loading || selectedFiles.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSelector;
