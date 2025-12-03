import React, { useState, useRef, useCallback } from 'react';
import { Analytics } from "@vercel/analytics/react";

// Components
import { 
  Navbar, 
  ContextPanel, 
  RepoInput, 
  FileSelector, 
  ResultsDashboard, 
  SkeletonLoader 
} from './components';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ProgressSteps } from './components/ui/ProgressSteps';
import { KeyboardShortcutsHelp } from './components/ui/KeyboardShortcutsHelp';

// Hooks
import { useTheme, useRecentSearches, useGitHub } from './hooks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Services
import { generateQuestions } from './services/ai';

// Utils
import { exportToPdf, exportToJson } from './utils/exportPdf';

/**
 * Main Application Component
 * Orchestrates the interview preparation workflow
 */
// Inner component that uses toast context
const RepoInterviewToolInner = () => {
  // Theme
  const { isDark, toggleTheme } = useTheme('light');
  
  // Toast notifications
  const toast = useToast();
  
  // Recent searches
  const { recentSearches, addToHistory } = useRecentSearches();
  
  // GitHub integration
  const { 
    loading: githubLoading, 
    error: githubError, 
    fileTree, 
    repoData, 
    scanRepository, 
    fetchCodeContext,
    setError: setGithubError
  } = useGitHub();

  // Local state
  const [repoUrl, setRepoUrl] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [questionType, setQuestionType] = useState('mixed');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [step, setStep] = useState('input'); // 'input' | 'file-select' | 'analyzing' | 'results'
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);
  
  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);

  // Combined loading state
  const isLoading = loading || githubLoading;
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+shift+l': toggleTheme,
    'mod+k': () => searchInputRef.current?.focus(),
    'escape': () => {
      if (step === 'file-select') setStep('input');
      if (step === 'results') setStep('file-select');
    },
  });

  /**
   * Handle repository scan
   */
  const handleScanRepo = async (urlOverride) => {
    const targetUrl = typeof urlOverride === 'string' ? urlOverride : repoUrl;
    if (!targetUrl) return;

    if (typeof urlOverride === 'string') {
      setRepoUrl(urlOverride);
    }

    setError(null);
    const result = await scanRepository(targetUrl);
    
    if (result.success) {
      setStep('file-select');
      setSelectedFiles([]);
      addToHistory(targetUrl);
      toast.success(`Found ${fileTree?.length || 0} files to analyze`);
    } else {
      toast.error(githubError || 'Failed to scan repository');
    }
  };

  /**
   * Handle analysis and question generation
   */
  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingText('Extracting Code Context...');
    setStep('analyzing');
    setError(null);

    try {
      // Fetch code context
      const { readme, codeContext } = await fetchCodeContext(selectedFiles);
      
      setLoadingText('Generating Interview Simulation...');
      
      // Generate questions
      const questions = await generateQuestions(
        readme, 
        codeContext, 
        resumeText, 
        questionType
      );
      
      setInterviewData(questions);
      setStep('results');
      toast.success('Interview questions generated!');
    } catch (err) {
      setError(err.message);
      setStep('file-select');
      toast.error(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download interview guide in various formats
   */
  const handleDownload = (format = 'md') => {
    if (!interviewData || !repoData) return;
    
    try {
      if (format === 'pdf') {
        exportToPdf(interviewData, repoData);
        toast.success('PDF export opened in new window');
      } else if (format === 'json') {
        exportToJson(interviewData, repoData);
        toast.success('JSON file downloaded');
      } else {
        const content = `
# Interview Prep Guide: ${repoData.repo}

## Project Summary
${interviewData.project_summary}

## Tech Stack
${interviewData.tech_stack?.join(', ') || 'N/A'}

## Questions
${interviewData.questions?.map((q, i) => `
### ${i + 1}. ${q.q} (${q.category})
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
        URL.revokeObjectURL(url);
        toast.success('Markdown file downloaded');
      }
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  return (
    <>
      <Analytics />
      <div className={`min-h-screen font-sans pb-20 transition-all duration-700 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-200 selection:bg-cyan-500/30' 
          : 'bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 selection:bg-cyan-200/50'
      }`}>
        {/* Background Effects */}
        <div 
          className="fixed inset-0 z-0 opacity-20 pointer-events-none"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }}
        />

        {/* Glowing Orbs */}
        <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 blur-[100px] rounded-full pointer-events-none z-0 ${
          isDark ? 'bg-cyan-500/10' : 'bg-blue-400/20'
        }`} />
        <div className={`fixed bottom-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none z-0 ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'
        }`} />

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
          {/* Navbar */}
          <Navbar
            isDark={isDark}
            showContextInput={showContextInput}
            setShowContextInput={setShowContextInput}
            toggleTheme={toggleTheme}
          />

          {/* Progress Steps */}
          <ProgressSteps currentStep={step} isDark={isDark} />

          {/* Context Panel */}
          {showContextInput && (
            <div className="space-y-4 mb-8">
              <ContextPanel
                resumeText={resumeText}
                setResumeText={setResumeText}
                isDark={isDark}
              />
            </div>
          )}

          {/* Step: Input */}
          {step === 'input' && (
            <RepoInput
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              loading={isLoading}
              error={error || githubError}
              recentSearches={recentSearches}
              onScan={handleScanRepo}
              isDark={isDark}
              inputRef={searchInputRef}
            />
          )}

          {/* Step: File Selection */}
          {step === 'file-select' && (
            <FileSelector
              fileTree={fileTree}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              questionType={questionType}
              setQuestionType={setQuestionType}
              error={error || githubError}
              loading={isLoading}
              onAnalyze={handleAnalyze}
              onCancel={() => setStep('input')}
              isDark={isDark}
            />
          )}

          {/* Step: Analyzing */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
              <SkeletonLoader isDark={isDark} />
              <div className="mt-8 text-center">
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {loadingText}
                </h2>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Processing architectural patterns...
                </p>
              </div>
            </div>
          )}

          {/* Step: Results */}
          {step === 'results' && interviewData && (
            <ResultsDashboard
              interviewData={interviewData}
              repoData={repoData}
              questionType={questionType}
              onBack={() => setStep('file-select')}
              onDownload={handleDownload}
              isDark={isDark}
            />
          )}

          {/* Keyboard Shortcuts Help */}
          <KeyboardShortcutsHelp isDark={isDark} />
        </div>
      </div>
    </>
  );
};

// Wrapper component with Toast Provider
const RepoInterviewTool = () => (
  <ToastProvider>
    <RepoInterviewToolInner />
  </ToastProvider>
);

export default RepoInterviewTool;
