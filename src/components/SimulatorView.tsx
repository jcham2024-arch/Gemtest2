import React, { useState } from 'react';
import {
  estimateTokens,
  estimateHistoryTokens,
  compactHistory,
  sanitizeEnvironment,
} from '../utils/roadmapLogic';
import { ChatMessage } from '../types/architecture';
import {
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Plus,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'react' | 'secret' | 'compactor' | 'sandbox'>('react');

  // --- 1. ReAct Simulator State ---
  const [reactQuery, setReactQuery] = useState<string>(
    'Fetch market telemetry for MSFT and calculate 30-day volatility index'
  );
  const [reactEngine, setReactEngine] = useState<'ts' | 'python'>('ts');
  const [reactRunning, setReactRunning] = useState<boolean>(false);
  const [reactEvents, setReactEvents] = useState<
    Array<{ step: string; type: 'thought' | 'action' | 'observation' | 'reply'; content: string }>
  >([]);

  const runReactSim = () => {
    setReactRunning(true);
    setReactEvents([]);

    setTimeout(() => {
      setReactEvents((prev) => [
        ...prev,
        {
          step: 'Turn 1: Model Thought',
          type: 'thought',
          content: 'The user wants financial market telemetry and volatility calculation. I will delegate data ingestion and math to guest tool: calculate_volatility.',
        },
      ]);
    }, 400);

    setTimeout(() => {
      const runnerName = reactEngine === 'ts' ? 'TypeScriptRunner (Deno --deny-net)' : 'PythonRunner (python3 -B -u)';
      setReactEvents((prev) => [
        ...prev,
        {
          step: `Turn 1: Tool Execution via ${runnerName}`,
          type: 'action',
          content: `Invoking function 'calculate_volatility' with rawArgumentsJson: {"ticker": "MSFT", "periodDays": 30, "samplePoints": 22}`,
        },
      ]);
    }, 1000);

    setTimeout(() => {
      setReactEvents((prev) => [
        ...prev,
        {
          step: 'Turn 2: Tool Observation (Standard Output)',
          type: 'observation',
          content: `{"status": "ok", "ticker": "MSFT", "annualizedVolatility": 0.234, "standardDeviation": 0.0147, "samplesEvaluated": 22, "executionMillis": 48}`,
        },
      ]);
    }, 1600);

    setTimeout(() => {
      setReactEvents((prev) => [
        ...prev,
        {
          step: 'Turn 2: Final Assistant Synthesis',
          type: 'reply',
          content: `The 30-day annualized volatility for MSFT is 23.4% based on 22 market session samples (daily standard deviation: 1.47%). Calculations executed in isolated ${reactEngine.toUpperCase()} guest sandbox with zero zombie processes.`,
        },
      ]);
      setReactRunning(false);
    }, 2200);
  };

  // --- 2. SecureSecret Simulator State ---
  const [secretInput, setSecretInput] = useState<string>('sk-proj-98239481948291048201-LIVE');
  const [secretDestroyed, setSecretDestroyed] = useState<boolean>(false);
  const [secretBuffer, setSecretBuffer] = useState<string[]>(
    'sk-proj-98239481948291048201-LIVE'.split('')
  );
  const [secretAccessLog, setSecretAccessLog] = useState<string>('Buffer initialized with defensive char[] clone.');

  const updateSecret = (val: string) => {
    setSecretInput(val);
    setSecretDestroyed(false);
    setSecretBuffer(val.split(''));
    setSecretAccessLog('Buffer updated with new defensive char[] array.');
  };

  const scrubSecret = () => {
    setSecretBuffer((prev) => prev.map(() => '\\0'));
    setSecretDestroyed(true);
    setSecretAccessLog('AutoCloseable.close() invoked: Buffer deterministically wiped with \\0 null bytes.');
  };

  const testAccessSecret = () => {
    if (secretDestroyed) {
      setSecretAccessLog('CRITICAL: accessSecret() threw IllegalStateException("Secret has already been destroyed")!');
    } else {
      setSecretAccessLog(`accessSecret() succeeded: ${secretBuffer.join('')}`);
    }
  };

  // --- 3. ContextCompactor Simulator State ---
  const [maxTokensAllowance, setMaxTokensAllowance] = useState<number>(100);
  const [sampleMessages, setSampleMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'SYSTEM', content: 'You are the Lean Java Agentic Core under strict zero-dependency constraints.' },
    { id: '2', role: 'USER', content: 'Initialize workspace and inspect current JDK version.' },
    { id: '3', role: 'ASSISTANT', content: 'Workspace verified on OpenJDK 21 LTS with java.base module.' },
    { id: '4', role: 'USER', content: 'Execute polyglot script test in Deno sandbox.' },
    { id: '5', role: 'ASSISTANT', content: 'TypeScript script finished with exit code 0 in 34ms.' },
    { id: '6', role: 'USER', content: 'Now run the final security memory hygiene verification.' },
  ]);

  const addTurn = () => {
    const nextId = String(sampleMessages.length + 1);
    const newMsg: ChatMessage = {
      id: nextId,
      role: Number(nextId) % 2 === 0 ? 'USER' : 'ASSISTANT',
      content: `Additional follow-up turn ${nextId} testing token budget preservation.`,
    };
    setSampleMessages((prev) => [...prev, newMsg]);
  };

  const rawTokens = estimateHistoryTokens(sampleMessages);
  const compacted = compactHistory(sampleMessages, maxTokensAllowance);
  const compactedTokens = estimateHistoryTokens(compacted);

  // --- 4. EnvironmentSanitizer Simulator State ---
  const [hostEnv, setHostEnv] = useState<Record<string, string>>({
    PATH: '/usr/local/bin:/usr/bin:/bin',
    TEMP: '/tmp/ljac-sandbox',
    USER: 'jvm_agent_daemon',
    AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    DATABASE_URL: 'postgres://admin:super_secret_pw@internal.db:5432/core',
    GITHUB_TOKEN: 'ghp_984719284719283719283719283719',
  });

  const [allowedKeys, setAllowedKeys] = useState<string[]>(['PATH', 'TEMP', 'USER']);

  const toggleAllowKey = (key: string) => {
    setAllowedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const sanitizedEnv = sanitizeEnvironment(hostEnv, allowedKeys);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Interactive Operational Playground
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          LJAC Core Engine Simulators
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          Test the runtime mechanics of the zero-dependency architecture: autonomous ReAct execution loops, memory-safe credential scrubbing, sliding-window token compaction, and process environment isolation.
        </p>
      </div>

      {/* Simulator Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('react')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'react'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          1. ReAct Cognitive Loop Simulator
        </button>
        <button
          onClick={() => setActiveTab('secret')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'secret'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          2. SecureSecret Memory Scrubbing Demo
        </button>
        <button
          onClick={() => setActiveTab('compactor')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'compactor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          3. TokenEstimator & ContextCompactor
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          4. EnvironmentSanitizer Sandbox
        </button>
      </div>

      {/* 1. ReAct Simulator */}
      {activeTab === 'react' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Autonomous ReAct (Thought → Action → Observation) Loop</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Demonstrates multi-turn cognitive cycle with tool invocation in an isolated guest process.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Guest Engine:</label>
              <select
                value={reactEngine}
                onChange={(e) => setReactEngine(e.target.value as 'ts' | 'python')}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="ts">TypeScript (Deno / Bun)</option>
                <option value="python">Python 3 (Venv / ML)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">User Query Prompt</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reactQuery}
                onChange={(e) => setReactQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={runReactSim}
                disabled={reactRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{reactRunning ? 'Executing Cycle...' : 'Run ReAct Cycle'}</span>
              </button>
            </div>
          </div>

          {/* Event Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Live Event Stream (UiBridge Observer)</span>
              <span>{reactEvents.length} cycles completed</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[220px] space-y-3 font-mono text-xs">
              {reactEvents.length === 0 ? (
                <div className="text-slate-600 text-center py-12">
                  Click "Run ReAct Cycle" to initiate cognitive loop...
                </div>
              ) : (
                reactEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border transition-all ${
                      ev.type === 'thought'
                        ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                        : ev.type === 'action'
                        ? 'bg-indigo-950/40 border-indigo-900/60 text-indigo-300'
                        : ev.type === 'observation'
                        ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                        : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1 opacity-80">
                      <span>{ev.step}</span>
                      <span className="uppercase text-[10px]">{ev.type}</span>
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap">{ev.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SecureSecret Simulator */}
      {activeTab === 'secret' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>SecureSecret Deterministic Memory Hygiene Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Demonstrates why mutable <code className="text-indigo-300 font-mono">char[]</code> buffers allow deterministic memory scrubbing, whereas standard Java <code className="text-rose-300 font-mono">String</code> objects leave sensitive API keys lingering in JVM heap dumps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Authorization Secret / API Key</label>
              <input
                type="text"
                value={secretInput}
                onChange={(e) => updateSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={scrubSecret}
                  disabled={secretDestroyed}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Invoke close() / Wipe Buffer</span>
                </button>

                <button
                  onClick={testAccessSecret}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Test accessSecret()
                </button>

                <button
                  onClick={() => updateSecret('sk-proj-98239481948291048201-LIVE')}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Reset secret"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* State Inspector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Internal Memory State</span>
                <span className={`font-mono text-xs font-semibold ${secretDestroyed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  destroyed: {String(secretDestroyed)}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="text-[11px] text-slate-500 font-mono">char[] secretBuffer contents:</div>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {secretBuffer.map((c, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded border ${
                        c === '\\0'
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-700 text-indigo-300'
                      }`}
                    >
                      {c === '\\0' ? '\\0' : c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-slate-500 font-semibold">JVM Execution Log:</span> {secretAccessLog}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ContextCompactor Simulator */}
      {activeTab === 'compactor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>ContextCompactor & TokenEstimator Sliding Window</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Demonstrates how sliding-window compaction preserves critical System instructions while defending against context overflow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300 font-medium">Max Token Allowance:</label>
              <input
                type="number"
                min={40}
                max={500}
                step={10}
                value={maxTokensAllowance}
                onChange={(e) => setMaxTokensAllowance(Number(e.target.value) || 50)}
                className="w-24 bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-400 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500 tabular-nums"
              />
              <button
                onClick={addTurn}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Turn</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Raw Conversation Tokens: </span>
              <span className="text-rose-400 font-bold tabular-nums">{rawTokens} tokens</span>
              <span className="text-slate-500 ml-2">({sampleMessages.length} turns)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Compacted Memory Footprint: </span>
              <span className="text-emerald-400 font-bold tabular-nums">{compactedTokens} tokens</span>
              <span className="text-slate-500 ml-2">({compacted.length} turns retained)</span>
            </div>
          </div>

          {/* Before & After comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Uncompacted Conversation History</div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {sampleMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="font-semibold text-indigo-400">Turn #{msg.id} [{msg.role}]</span>
                      <span className="tabular-nums">{estimateTokens(msg.content)} tokens</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-emerald-400">Compacted Payload (Sent over HTTP/2)</div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {compacted.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-lg bg-slate-950 border border-emerald-950/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`font-semibold ${msg.role === 'SYSTEM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        Turn #{msg.id} [{msg.role}] {msg.role === 'SYSTEM' && '(Preserved)'}
                      </span>
                      <span className="text-slate-400 tabular-nums">{estimateTokens(msg.content)} tokens</span>
                    </div>
                    <div className="text-slate-200 leading-relaxed">{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EnvironmentSanitizer Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span>EnvironmentSanitizer Process Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guest scripts execute in isolated OS processes. The sanitizer strips 100% of host credentials before ProcessBuilder launches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Host Environment Variables</div>
              <div className="space-y-2">
                {Object.entries(hostEnv).map(([key, val]) => {
                  const isDangerous = key.includes('KEY') || key.includes('URL') || key.includes('TOKEN');
                  const isAllowed = allowedKeys.includes(key);

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                        isDangerous
                          ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="truncate max-w-[280px]">
                        <span className="font-semibold">{key}: </span>
                        <span className="text-slate-400">{val}</span>
                      </div>
                      <button
                        onClick={() => toggleAllowKey(key)}
                        className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          isAllowed
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAllowed ? 'Allowed' : 'Blocked'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-emerald-400">Sanitized Child Process Block</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                {Object.keys(sanitizedEnv).length === 0 ? (
                  <div className="text-slate-500">All environment variables stripped.</div>
                ) : (
                  Object.entries(sanitizedEnv).map(([k, v]) => (
                    <div key={k} className="text-slate-300">
                      <span className="text-emerald-400 font-semibold">{k}</span> = "{v}"
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 inline-block mr-1 text-emerald-400" />
                Notice that all database credentials, tokens, and AWS secret keys are completely absent from child processes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
