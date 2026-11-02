import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  BrainCircuit,
  ExternalLink,
  Loader2,
  Send,
  AlertCircle,
} from 'lucide-react';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  codeContext?: string;
}

export const AiConsultantModal: React.FC<AiConsultantModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  codeContext = '',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [mode, setMode] = useState<'grounded' | 'thinking'>('grounded');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    answer: string;
    model: string;
    sources?: Array<{ title: string; uri: string }>;
    searchQueries?: string[];
    thinkingLevel?: string;
  } | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const endpoint = mode === 'grounded' ? '/api/research' : '/api/deep-think';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          topic: 'Lean Java Agentic Core (LJAC)',
          codeContext: codeContext || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete architectural analysis');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Architectural analysis error:', err);
      setError(
        err?.message ||
          'Server communication failure. Please ensure GEMINI_API_KEY is configured in the Secrets panel.'
      );
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    {
      title: 'ProcessHandle Descendants',
      prompt:
        'Explain how JDK 21 ProcessHandle.descendants() eliminates zombie subprocesses spawned by Deno or Python guest scripts during agent tool execution.',
      suggestedMode: 'grounded' as const,
    },
    {
      title: 'Deno vs Bun Sandboxing',
      prompt:
        'Compare Deno sandbox security flags (such as --deny-net and directory allowlists) versus Bun for untrusted agent-generated guest scripts.',
      suggestedMode: 'grounded' as const,
    },
    {
      title: 'char[] Memory Hygiene Proof',
      prompt:
        'Formally analyze why mutable char[] buffers with null-byte zeroing protect against heap dumps and memory inspection compared to immutable java.lang.String.',
      suggestedMode: 'thinking' as const,
    },
    {
      title: 'Zero-Dependency SSE Parser',
      prompt:
        'Outline a zero-dependency SSE parser for Java 21 HttpClient reading data: lines without blocking worker threads.',
      suggestedMode: 'thinking' as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Architectural Research & Consultant</h3>
              <div className="text-[11px] text-slate-400">
                Grounding via gemini-3.8-flash · High Thinking via gemini-4-argon
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Mode Selector */}
          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMode('grounded')}
              className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'grounded'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search-Grounded Research (gemini-3.8-flash)</span>
            </button>
            <button
              onClick={() => setMode('thinking')}
              className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'thinking'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>High-Thinking Deep Analysis (gemini-4-argon)</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Quick Research Questions
            </div>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p.prompt);
                    setMode(p.suggestedMode);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Architectural Inquiry / Review Query</label>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a technical architecture question regarding Java 21, zero-dependency JSON, virtual threads, process isolation, or security hygiene..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {codeContext && (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono truncate">
              Attached code context: {codeContext.substring(0, 120)}...
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Result Output */}
          {result && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
                <span className="text-indigo-400 font-semibold">Model: {result.model}</span>
                {result.thinkingLevel && (
                  <span className="text-purple-400 font-semibold">Thinking: {result.thinkingLevel}</span>
                )}
              </div>

              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {result.answer}
              </div>

              {/* Citations if Grounded */}
              {result.sources && result.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-semibold">Web Citations:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 hover:text-white flex items-center gap-1"
                      >
                        <span className="truncate max-w-[200px]">{s.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-500 font-mono">
            {mode === 'grounded' ? 'Search Grounding Active' : 'ThinkingLevel.HIGH Active'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExecute}
              disabled={loading || !query.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Inquiry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
