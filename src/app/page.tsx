'use client';
import { useState, useRef, useEffect } from 'react';
import { ToastContainer, showToast } from '@/components/Toast';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Home() {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<null | {
    score: number;
    matched: string[];
    missing: string[];
    suggestions: { suggestions: { original: string; suggested: string }[] };
    cached?: boolean;
  }>(null);
  
  const resultsRef = useRef<HTMLElement>(null);

  const analysisSteps = [
    'Extracting Keywords',
    'Matching Resume',
    'Generating Suggestions',
    'Complete'
  ];

  // Scroll to results when data is available
  useEffect(() => {
    if (data && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [data]);

  async function analyze() {
    if (!resume.trim() || !jobDesc.trim()) {
      showToast('Please paste both your resume and the job description.', 'warning');
      return;
    }

    if (resume.length < 50 || jobDesc.length < 50) {
      showToast('Resume and job description seem too short. Please provide more details.', 'warning');
      return;
    }

    setLoading(true);
    setProgress(0);
    setData(null);

    try {
      // Step 1: Start analysis
      setProgress(0);
      
      const startTime = Date.now();
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDesc }),
      });

      const j = await r.json();
      
      // Handle rate limiting
      if (r.status === 429) {
        const resetTime = j.resetAt ? new Date(j.resetAt).toLocaleTimeString() : 'soon';
        showToast(`Rate limit exceeded. Please try again at ${resetTime}.`, 'error');
        return;
      }

      // Handle other errors
      if (!r.ok) {
        const errorMsg = typeof j.error === 'string' 
          ? j.error 
          : 'Analysis failed. Please try again.';
        showToast(errorMsg, 'error');
        return;
      }

      // Simulate progress for better UX
      setProgress(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(2);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(3);

      const duration = Date.now() - startTime;
      
      setData(j);
      
      // Show success message
      if (j.cached) {
        showToast('Analysis loaded from cache! ⚡', 'success');
      } else {
        showToast(`Analysis complete in ${(duration / 1000).toFixed(1)}s!`, 'success');
      }

    } catch (e: any) {
      console.error('Analysis error:', e);
      showToast(e.message ?? 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  }

  return (
    <>
      <ToastContainer />
      <main className="min-h-screen bg-gray-900 text-gray-200 p-6 md:p-10">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">AI-Powered ATS Resume Checker</h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Paste your resume and a job description. We&apos;ll find keywords, score the match, and suggest edits.
        </p>
      </header>

      <section className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-2">Your Resume</label>
            <textarea value={resume} onChange={e=>setResume(e.target.value)} rows={14}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"/>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2">Job Description</label>
            <textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value)} rows={14}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"/>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={analyze} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-70 transition-all transform hover:scale-105 disabled:hover:scale-100">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : 'Analyze Resume'}
          </button>
          
          {loading && (
            <div className="mt-6">
              <ProgressBar steps={analysisSteps} currentStep={progress} />
            </div>
          )}
        </div>
      </section>

      {loading && !data && (
        <section className="mt-10 bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-center mb-6">Analyzing Your Resume...</h2>
          <LoadingSkeleton />
        </section>
      )}

      {data && (
        <section ref={resultsRef} className="mt-10 bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-center">Analysis Results</h2>
            {data.cached && (
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full animate-pulse">
                ⚡ CACHED
              </span>
            )}
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-400 text-lg">Job Description Match Score</p>
            <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full mt-2 ${
              data.score < 50 ? 'bg-red-600' : data.score < 75 ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}>
              <span className="text-5xl font-bold text-white">{data.score}%</span>
            </div>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              {data.score < 50 ? 'Needs significant work—try adding missing keywords below.' : data.score < 75 ? 'Decent match—refine with suggestions below.' : 'Excellent match!'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-emerald-400">Matched Keywords</h3>
              <div className="p-4 bg-gray-900 rounded-xl min-h-[100px] flex flex-wrap gap-2 items-start content-start">
                {data.matched.length > 0 ? (
                  data.matched.map((k, i) => (
                    <span key={i} className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-500 text-white whitespace-nowrap">{k}</span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No matched keywords found</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-red-400">Missing Keywords</h3>
              <div className="p-4 bg-gray-900 rounded-xl min-h-[100px] flex flex-wrap gap-2 items-start content-start">
                {data.missing.length > 0 ? (
                  data.missing.map((k, i) => (
                    <span key={i} className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white whitespace-nowrap">{k}</span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">All keywords matched!</p>
                )}
              </div>
            </div>
          </div>

          {!!data.suggestions?.suggestions?.length && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-center mb-4">Suggested Edits</h3>
              <div className="space-y-4">
                {data.suggestions.suggestions.map((s, i) => (
                  <div key={i} className="p-4 bg-gray-900 rounded-lg border-l-4 border-indigo-600 group hover:border-indigo-400 transition-all">
                    <p className="text-sm text-gray-400 mb-1">Original:</p>
                    <p className="text-gray-300 italic mb-3">&quot;{s.original}&quot;</p>
                    <p className="text-sm text-emerald-400 mb-1 flex items-center justify-between">
                      <span>Suggestion:</span>
                      <button
                        onClick={() => copyToClipboard(s.suggested)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs text-white"
                      >
                        Copy
                      </button>
                    </p>
                    <p className="text-white font-semibold">&quot;{s.suggested}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
    </>
  );
}
