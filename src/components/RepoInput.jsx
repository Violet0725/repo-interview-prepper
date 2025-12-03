import React from 'react';
import { 
  Terminal, 
  Loader2, 
  History, 
  AlertCircle,
  Search,
  FileCode,
  GraduationCap
} from 'lucide-react';

/**
 * Repository URL input component with recent searches
 */
export const RepoInput = ({ 
  repoUrl, 
  setRepoUrl, 
  loading, 
  error, 
  recentSearches, 
  onScan, 
  isDark 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onScan();
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Guide Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: Search,
            title: '1. Target',
            desc: 'Paste public GitHub URL',
            lightClass: 'bg-blue-50 text-blue-600',
            darkClass: 'bg-blue-900/30 text-blue-400'
          },
          {
            icon: FileCode,
            title: '2. Select',
            desc: 'Pick files for AI analysis',
            lightClass: 'bg-purple-50 text-purple-600',
            darkClass: 'bg-purple-900/30 text-purple-400'
          },
          {
            icon: GraduationCap,
            title: '3. Simulate',
            desc: 'Get grilled by AI',
            lightClass: 'bg-emerald-50 text-emerald-600',
            darkClass: 'bg-emerald-900/30 text-emerald-400'
          }
        ].map((item, i) => (
          <div
            key={i}
            className={`border p-4 rounded-xl flex flex-col items-center text-center backdrop-blur-md hover:-translate-y-1 transition-transform duration-300 ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800' 
                : 'bg-white/40 border-white/50 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              isDark ? item.darkClass : item.lightClass
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative group mb-8">
        {isDark && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-1000" />
        )}
        <div className={`relative border rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl backdrop-blur-xl ${
          isDark 
            ? 'bg-slate-900/60 border-slate-700/50' 
            : 'bg-white/60 border-white/50'
        }`}>
          <div className="flex-1 relative">
            <Terminal className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="github.com/username/repository"
              className={`w-full h-14 pl-12 pr-4 bg-transparent rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={onScan}
            disabled={loading || !repoUrl}
            className="h-14 px-8 bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-cyan-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "SCAN REPO"}
          </button>
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            <History className="w-3 h-3" /> Recent Targets
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {recentSearches.map((url, i) => (
              <button
                key={i}
                onClick={() => {
                  setRepoUrl(url);
                  onScan(url);
                }}
                className={`px-3 py-1.5 rounded-full border text-xs transition-colors backdrop-blur-sm active:scale-95 ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'
                    : 'bg-white/60 border-white/50 text-slate-600 hover:border-cyan-400 hover:text-cyan-700 shadow-sm'
                }`}
              >
                {url.replace('https://github.com/', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`mt-6 p-4 border rounded-lg text-sm flex items-center justify-center gap-2 backdrop-blur-sm ${
          isDark 
            ? 'bg-red-950/30 border-red-900/50 text-red-400' 
            : 'bg-red-50/50 border-red-200 text-red-600'
        }`}>
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
};

export default RepoInput;
