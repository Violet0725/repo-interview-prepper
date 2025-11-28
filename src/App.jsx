import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Brain, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Terminal, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Cpu, 
  History, 
  Download, 
  User, 
  MessageSquare, 
  Send, 
  X, 
  Briefcase, 
  Layers, 
  Eye, 
  EyeOff, 
  Search, 
  FileCode, 
  GraduationCap, 
  Sun, 
  Moon,
  Settings,
  Key
} from 'lucide-react';

const RepoInterviewTool = () => {
  // --- State: Configuration ---
  const [theme, setTheme] = useState('light'); 
  const [apiKey, setApiKey] = useState(''); // Restored for local testing
  const [resumeText, setResumeText] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New settings toggle
  const [questionType, setQuestionType] = useState('mixed'); 

  // --- State: Workflow ---
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [step, setStep] = useState('input'); 
  const [error, setError] = useState(null);
  
  // --- State: Data ---
  const [fileTree, setFileTree] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // --- Effects ---
  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    setRecentSearches(savedSearches);
    
    // Persist key for convenience in preview
    const savedKey = localStorage.getItem('openai_api_key_local');
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem('openai_api_key_local', apiKey);
  }, [apiKey]);

  // --- Helpers ---
  const isDark = theme === 'dark';

  const parseRepoUrl = (url) => {
    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(regex);
      if (match) return { owner: match[1], repo: match[2].replace('.git', '') };
      return null;
    } catch (e) {
      return null;
    }
  };

  const decodeContent = (base64) => {
    try {
      return decodeURIComponent(escape(window.atob(base64)));
    } catch (e) {
      return "Unable to decode file content.";
    }
  };

  const addToHistory = (url) => {
    const newHistory = [url, ...recentSearches.filter(u => u !== url)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('recent_searches', JSON.stringify(newHistory));
  };

  // --- Visual Helpers ---

  const renderMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={isDark ? "text-cyan-300 font-bold" : "text-cyan-700 font-bold"}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs ${isDark ? "bg-slate-800 text-cyan-300 border border-slate-700" : "bg-slate-100 text-cyan-600 border border-slate-200"}`}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // --- API Interactions ---

  const fetchRepoStructure = async (urlOverride) => {
    const targetUrl = typeof urlOverride === 'string' ? urlOverride : repoUrl;

    if (!targetUrl) return;

    if (typeof urlOverride === 'string') {
        setRepoUrl(urlOverride);
    }

    const repoInfo = parseRepoUrl(targetUrl);
    
    if (!repoInfo) {
      setError("Invalid GitHub URL. Format: https://github.com/owner/repo");
      return;
    }

    setLoading(true);
    setLoadingText('Scanning Repository Structure...');
    setError(null);

    const headers = { 'Accept': 'application/vnd.github.v3+json' };

    try {
      const repoDetailsRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers });
      if (!repoDetailsRes.ok) throw new Error("Could not access repository. Is it private?");
      const repoDetails = await repoDetailsRes.json();
      const defaultBranch = repoDetails.default_branch || 'main';

      const treeRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
      if (!treeRes.ok) throw new Error("Could not scan files.");
      
      const data = await treeRes.json();
      
      const interestingFiles = data.tree
        .filter(f => {
          if (f.type !== 'blob') return false; 
          const path = f.path;
          
          if (path.includes('node_modules/') || 
              path.includes('dist/') || 
              path.includes('build/') || 
              path.includes('.git/') ||
              path.includes('coverage/')) return false;

          return path.match(/\.(js|jsx|ts|tsx|py|rb|go|java|rs|cpp|c|h|php|swift|kt|dart|vue|svelte|html|css|sql|graphql)$/i) && 
                 !path.match(/\.(min\.js|test\.js|spec\.js|d\.ts)$/i); 
        })
        .map(f => f.path)
        .slice(0, 50); 

      setFileTree(interestingFiles);
      setRepoData({ owner: repoInfo.owner, repo: repoInfo.repo });
      setStep('file-select');
      addToHistory(targetUrl);

    } catch (err) {
      setError(err.message);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepo = async () => {
    setLoading(true);
    setLoadingText('Extracting Code Context...');
    setStep('analyzing');

    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      const { owner, repo } = repoData;

      let readmeContent = "";
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (readmeRes.ok) {
          const data = await readmeRes.json();
          readmeContent = decodeContent(data.content);
        }
      } catch (e) { console.warn("No README"); }

      let codeContext = "";
      for (const file of selectedFiles) {
        try {
          const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers });
          if (fileRes.ok) {
            const data = await fileRes.json();
            const content = decodeContent(data.content);
            codeContext += `\n--- FILE: ${file} ---\n${content.slice(0, 2000)}\n`; 
          }
        } catch (e) { console.warn(`Failed to read ${file}`); }
      }

      setLoadingText('Generating Interview Simulation...');
      const questions = await generateQuestions(readmeContent, codeContext);
      setInterviewData(questions);
      setStep('results');

    } catch (err) {
      setError(err.message);
      setStep('file-select');
    } finally {
      setLoading(false);
    }
  };

  // Secure API Call (Proxies to Backend)
  const generateQuestions = async (readme, code) => {
    let typePrompt = "";
    if (questionType === 'technical') {
      typePrompt = "Generate ONLY technical questions. Focus on code logic, complexity, design patterns, and library choices.";
    } else if (questionType === 'behavioral') {
      typePrompt = "Generate ONLY behavioral questions using the STAR method. Ask about challenges faced, prioritization, and conflict resolution.";
    } else {
      typePrompt = "Generate a mix of 2 Technical, 2 Architectural, and 2 Behavioral questions.";
    }

    const prompt = `
      Act as a Senior Technical Interviewer. 
      
      CONTEXT:
      1. README SUMMARY: ${readme ? readme.slice(0, 2000) : "N/A"}
      2. SELECTED CODE SNIPPETS: ${code ? code : "No specific code files selected."}
      3. CANDIDATE RESUME/CONTEXT: ${resumeText ? resumeText.slice(0, 1000) : "N/A"}

      TASK:
      Generate a JSON object with interview content based on this constraint: ${typePrompt}
      
      Structure:
      {
        "project_summary": "Technical summary of the repo.",
        "tech_stack": ["Tech1", "Tech2"],
        "questions": [
          {
            "category": "Architecture" | "Technical" | "Behavioral",
            "q": "The question",
            "strategy": "A brief 1-2 sentence hint on what direction the answer should take.",
            "sample_answer": "A complete, impressive, first-person 'Perfect Answer' that the candidate can study.",
            "difficulty": "Junior" | "Mid" | "Senior"
          }
        ]
      }
      
      Generate exactly 6 questions. 
    `;

    // Calls local backend (api/chat.js) instead of OpenAI directly
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You output only valid JSON." },
          { role: "user", content: prompt }
        ],
        // FORCE JSON MODE FOR QUESTIONS to make it fast
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        let errorMsg = "Unknown Error";
        try {
            const errData = await response.json();
            errorMsg = errData.error || response.statusText;
        } catch (e) {
            errorMsg = `Server Error: ${response.status}`;
        }
        throw new Error(errorMsg);
    }
    
    const data = await response.json();
    if (data.content) {
          const jsonStr = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(jsonStr);
    }
    return data;
  };

  const downloadGuide = () => {
    if (!interviewData) return;
    const content = `
# Interview Prep Guide: ${repoData.repo}

## Project Summary
${interviewData.project_summary}

## Tech Stack
${interviewData.tech_stack.join(', ')}

## Questions
${interviewData.questions.map((q, i) => `
### ${i+1}. ${q.q} (${q.category})
**Strategy:** ${q.strategy}
**Sample Answer:** ${q.sample_answer}
`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoData.repo}_interview_prep.md`;
    a.click();
  };

  // --- Sub-Components ---

  const SkeletonLoader = () => (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className={`h-8 w-64 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-2 h-32 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-24 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );

  const MockChat = ({ question, idealAnswer, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [evaluating, setEvaluating] = useState(false);

    const handleSend = async () => {
      if (!input.trim()) return;
      const userMsg = input;
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      setInput('');
      setEvaluating(true);

      try {
        // Calls local backend - NO JSON MODE FOR CHAT so AI can talk freely
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are an interviewer. Grade the candidate's answer based on the ideal answer. Be constructive but brief." },
              { role: "user", content: `Question: ${question}\nIdeal Logic: ${idealAnswer}\nCandidate Answer: ${userMsg}\n\nProvide feedback.` }
            ]
          })
        });
        
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI tutor." }]);
      } finally {
        setEvaluating(false);
      }
    };

    return (
      <div className={`border rounded-lg p-4 mt-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-md ${isDark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-white/50 shadow-sm'}`}>
        <div className={`flex justify-between items-center mb-4 border-b pb-2 ${isDark ? 'border-slate-800/50' : 'border-slate-200/50'}`}>
          <span className="text-xs font-mono text-cyan-500 uppercase">Live Simulation</span>
          <button onClick={onBack} className={`${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}><X className="w-4 h-4" /></button>
        </div>
        
        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className={`text-sm italic text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type your answer below to start...</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm backdrop-blur-sm ${m.role === 'user' 
                ? (isDark ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-800/50' : 'bg-blue-100/80 text-blue-900 border border-blue-200/50') 
                : (isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-white/70 text-slate-700 border border-slate-200/50 shadow-sm')}`}>
                {renderMarkdown(m.content)}
              </div>
            </div>
          ))}
          {evaluating && (
             <div className="flex justify-start">
               <div className={`rounded-lg p-3 backdrop-blur-sm ${isDark ? 'bg-slate-800/60' : 'bg-white/70 border border-slate-200/50 shadow-sm'}`}><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
             </div>
          )}
        </div>

        <div className="flex gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
            className={`flex-1 border rounded-md px-3 py-2 text-sm focus:border-cyan-500 outline-none transition-all backdrop-blur-sm ${isDark ? 'bg-slate-950/50 border-slate-700/50 text-white' : 'bg-white/50 border-slate-300/50 text-slate-900 focus:bg-white/80'}`}
          />
          <button onClick={handleSend} disabled={evaluating} className="p-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-md text-white transition-all shadow-lg shadow-cyan-900/20">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ q }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [mode, setMode] = useState('view'); 

    return (
      <div className="group relative mb-4">
        {isDark && (
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg opacity-20 group-hover:opacity-100 transition duration-500 blur ${isOpen ? 'opacity-75' : ''}`}></div>
        )}
        <div className={`relative border rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-lg ${isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/60 border-white/50 shadow-sm hover:shadow-md'}`}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full text-left p-5 flex justify-between items-start gap-4 transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-white/40'}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-mono rounded border backdrop-blur-md ${isDark ? 'text-cyan-400 bg-cyan-950/30 border-cyan-900/50' : 'text-cyan-700 bg-cyan-50/50 border-cyan-200/50'}`}>
                  <Terminal className="w-3 h-3 mr-1" />
                  {q.category}
                </span>
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
              <h3 className={`text-lg font-medium transition-colors ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-cyan-700'}`}>
                {q.q}
              </h3>
            </div>
            {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-500 mt-1" /> : <ChevronDown className="w-5 h-5 text-slate-400 mt-1" />}
          </button>
          
          {isOpen && (
            <div className={`p-5 border-t backdrop-blur-md ${isDark ? 'bg-slate-950/30 border-slate-800/30' : 'bg-slate-50/30 border-slate-100/50'}`}>
              {mode === 'view' ? (
                <>
                   <div className="flex gap-4 mb-6">
                    <div className="min-w-[24px] pt-1">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2">Answer Strategy</h4>
                      <p className={`leading-relaxed text-sm md:text-base font-light ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {renderMarkdown(q.strategy)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <button 
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 hover:text-emerald-400 transition-colors"
                    >
                      {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}
                    </button>
                    
                    {showAnswer && (
                      <div className={`border rounded-lg p-4 animate-in fade-in slide-in-from-top-1 backdrop-blur-sm ${isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-200/50'}`}>
                        <p className={`text-sm leading-relaxed italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          "{renderMarkdown(q.sample_answer)}"
                        </p>
                      </div>
                    )}
                  </div>

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
                <MockChat question={q.q} idealAnswer={q.sample_answer} onBack={() => setMode('view')} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans pb-20 transition-all duration-700 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-200 selection:bg-cyan-500/30' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 selection:bg-cyan-200/50'}`}>
      {/* Background FX (Universal - Changes based on theme) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Glowing Orbs - Active in BOTH Light and Dark modes now */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 blur-[100px] rounded-full pointer-events-none z-0 ${isDark ? 'bg-cyan-500/10' : 'bg-blue-400/20'}`}></div>
      <div className={`fixed bottom-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none z-0 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'}`}></div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Navbar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-lg backdrop-blur-md ${isDark ? 'bg-slate-900/60 border-slate-700/50 shadow-cyan-500/10' : 'bg-white/60 border-white/50 shadow-slate-200/50'}`}>
                <Github className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-900'}`} />
             </div>
             <div>
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Repo Interview <span className="text-cyan-500">Prepper</span>
                </h1>
                <div className="flex gap-2 text-xs text-slate-500 font-mono mt-1">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> v2.6.0</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-Enhanced</span>
                </div>
             </div>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => setShowContextInput(!showContextInput)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md active:scale-95 ${
                  showContextInput 
                    ? (isDark ? 'bg-slate-800/80 border-purple-500/50 text-purple-400' : 'bg-purple-50/80 border-purple-200 text-purple-700') 
                    : (isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600' : 'bg-white/60 border-white/50 text-slate-500 hover:border-slate-300 shadow-sm')
                }`}
             >
               <User className="w-3 h-3" /> Context
             </button>

             {/* Settings Toggle */}
             <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all backdrop-blur-md active:scale-95 ${
                  showSettings
                    ? (isDark ? 'bg-slate-800 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-300 text-cyan-600') 
                    : (isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600' : 'bg-white/60 border-white/50 text-slate-500 hover:border-slate-300 shadow-sm')
                }`}
             >
               <Settings className="w-4 h-4" />
             </button>
             
             {/* Theme Toggle */}
             <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
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

        {/* Collapsible Panels */}
        <div className="space-y-4 mb-8">
          
          {/* Settings / API Key Panel */}
          {showSettings && (
            <div className={`backdrop-blur-xl border rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-2 ${isDark ? 'bg-slate-900/60 border-cyan-900/30' : 'bg-white/60 border-cyan-100/50'}`}>
              <div className="flex items-center gap-2 mb-3">
                 <Key className="w-4 h-4 text-cyan-500" />
                 <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>API Configuration</span>
              </div>
              <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter your API key below for local testing. In production, this can be hidden on the backend.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className={`flex-1 border rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none transition-all backdrop-blur-sm ${isDark ? 'bg-slate-950/50 border-slate-700 text-white' : 'bg-white/50 border-slate-200 text-slate-700 focus:bg-white/80'}`}
                />
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                    Get Key
                </a>
              </div>
            </div>
          )}

          {showContextInput && (
            <div className={`backdrop-blur-xl border rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-2 ${isDark ? 'bg-slate-900/60 border-purple-900/30' : 'bg-white/60 border-purple-100/50'}`}>
              <div className="flex items-center gap-2 mb-3">
                 <FileText className="w-4 h-4 text-purple-500" />
                 <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Resume / Job Description Context</span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume summary here..."
                className={`w-full h-32 border rounded-lg p-4 text-sm focus:border-purple-500 outline-none resize-none backdrop-blur-sm ${isDark ? 'bg-slate-950/50 border-slate-700 text-slate-300' : 'bg-white/50 border-slate-200 text-slate-700 focus:bg-white/80'}`}
              />
            </div>
          )}
        </div>

        {/* WORKFLOW STEPS */}

        {/* 1. INPUT STEP */}
        {step === 'input' && (
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
                <div key={i} className={`border p-4 rounded-xl flex flex-col items-center text-center backdrop-blur-md hover:-translate-y-1 transition-transform duration-300 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/40 border-white/50 shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isDark ? item.darkClass : item.lightClass}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="relative group mb-8">
              {isDark && <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>}
              <div className={`relative border rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-white/50'}`}>
                <div className="flex-1 relative">
                  <Terminal className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="github.com/username/repository"
                    className={`w-full h-14 pl-12 pr-4 bg-transparent rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRepoStructure()}
                  />
                </div>
                <button
                  onClick={fetchRepoStructure}
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
                            onClick={() => fetchRepoStructure(url)} 
                            className={`px-3 py-1.5 rounded-full border text-xs transition-colors backdrop-blur-sm active:scale-95 ${
                          isDark 
                            ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400' 
                            : 'bg-white/60 border-white/50 text-slate-600 hover:border-cyan-400 hover:text-cyan-700 shadow-sm'
                        }`}>
                           {url.replace('https://github.com/', '')}
                        </button>
                     ))}
                  </div>
               </div>
            )}
            
            {error && (
              <div className={`mt-6 p-4 border rounded-lg text-sm flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-red-50/50 border-red-200/50 text-red-600'}`}>
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        )}

        {/* 2. FILE SELECTION STEP */}
        {step === 'file-select' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
             <div className={`border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/70 border-white/50'}`}>
                <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'}`}>
                   <div>
                      <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Deep Dive Selection</h2>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select critical files to include in the AI analysis context.</p>
                   </div>
                   <div className={`text-xs font-mono px-2 py-1 rounded border backdrop-blur-md ${isDark ? 'bg-cyan-950/50 text-cyan-400 border-cyan-900' : 'bg-cyan-50/50 text-cyan-700 border-cyan-200'}`}>
                      {selectedFiles.length} Selected
                   </div>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                   {fileTree.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic">No readable files found in root.</div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                         {fileTree.map(file => (
                            <button 
                               key={file}
                               onClick={() => {
                                  if (selectedFiles.includes(file)) setSelectedFiles(selectedFiles.filter(f => f !== file));
                                  else if (selectedFiles.length < 3) setSelectedFiles([...selectedFiles, file]);
                               }}
                               className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all border backdrop-blur-sm ${
                                 selectedFiles.includes(file) 
                                   ? (isDark ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-100' : 'bg-cyan-50/80 border-cyan-200 text-cyan-800 shadow-sm')
                                   : (isDark ? 'bg-slate-950/30 border-slate-800/50 text-slate-400 hover:bg-slate-800/50' : 'bg-white/40 border-slate-100 text-slate-600 hover:bg-white/60')
                               }`}
                            >
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedFiles.includes(file) ? 'border-cyan-500 bg-cyan-500' : (isDark ? 'border-slate-600' : 'border-slate-300')}`}>
                                  {selectedFiles.includes(file) && <CheckCircle2 className="w-3 h-3 text-white" />}
                               </div>
                               <span className="font-mono text-sm truncate">{file}</span>
                            </button>
                         ))}
                      </div>
                   )}
                </div>
                
                {/* Error Banner */}
                {error && (
                  <div className={`mx-6 mt-4 p-3 border rounded-lg text-xs flex items-center gap-2 ${isDark ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    <AlertCircle className="w-4 h-4" /> 
                    <span>{error}</span>
                  </div>
                )}
                
                {/* Mode Selection Toolbar */}
                <div className={`px-6 py-4 border-t flex flex-col md:flex-row gap-4 justify-between items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-100'}`}>
                   
                   <div className={`flex p-1 rounded-lg border backdrop-blur-sm ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
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

                   <div className="flex gap-3">
                     <button onClick={() => setStep('input')} className={`px-4 py-2 text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Cancel</button>
                     <button 
                        onClick={analyzeRepo} 
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 flex items-center gap-2 active:scale-95 transition-transform"
                     >
                        <Brain className="w-4 h-4" />
                        Generate
                     </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 3. LOADING */}
        {step === 'analyzing' && (
           <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
              <SkeletonLoader />
              <div className="mt-8 text-center">
                 <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{loadingText}</h2>
                 <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Processing architectural patterns...</p>
              </div>
           </div>
        )}

        {/* 4. RESULTS DASHBOARD */}
        {step === 'results' && interviewData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             
             {/* Toolbar */}
             <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep('file-select')} className={`text-sm flex items-center gap-1 ${isDark ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'}`}>
                   <ChevronDown className="w-4 h-4 rotate-90" /> Back to Files
                </button>
                <button onClick={downloadGuide} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors backdrop-blur-md active:scale-95 ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-white/60 hover:bg-white/80 border-slate-200 text-slate-600 shadow-sm'}`}>
                   <Download className="w-4 h-4" /> Download Brief
                </button>
             </div>

             {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className={`col-span-2 p-6 border rounded-2xl backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-white/50 shadow-sm'}`}>
                   <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Executive Summary
                   </h3>
                   <p className={`leading-relaxed text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{interviewData.project_summary}</p>
                </div>
                <div className={`p-6 border rounded-2xl backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-white/50 shadow-sm'}`}>
                   <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Tech Stack
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {interviewData.tech_stack.map((t, i) => (
                         <span key={i} className={`px-2 py-1 border rounded text-xs ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-600'}`}>{t}</span>
                      ))}
                   </div>
                </div>
             </div>

             {/* Questions */}
             <div>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                   <Zap className="w-5 h-5 text-yellow-500" /> Interview Simulation
                   <span className={`text-sm font-normal ml-2 border px-2 py-0.5 rounded-full capitalize ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200'}`}>
                      {questionType} Mode
                   </span>
                </h2>
                {interviewData.questions.map((q, idx) => (
                   <QuestionCard key={idx} q={q} />
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RepoInterviewTool;