import React, { useState } from 'react';
import {
  estimateTokens,
  estimateHistoryTokens,
  compactHistory,
  sanitizeEnvironment,
  validateHandoffEnvelope,
  validateResultContract,
  checkCarrierPinning,
  checkProtectionInventoryMonotonicity,
  validateMcpDescriptor,
} from '../utils/roadmapLogic';
import { ChatMessage, HandoffEnvelope, ResultContract } from '../types/architecture';
import { SAMPLE_HANDOFF_ENVELOPE, SAMPLE_RESULT_CONTRACT } from '../data/projectData';
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
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'react' | 'secret' | 'compactor' | 'sandbox' | 'hcat' | 'invariants'>('react');

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
          step: 'Turn 1: Tool Observation',
          type: 'observation',
          content: 'Observation result: {"ticker": "MSFT", "annualizedVolatility": 0.228, "status": "computed", "elapsedMs": 42}',
        },
      ]);
    }, 1600);

    setTimeout(() => {
      setReactEvents((prev) => [
        ...prev,
        {
          step: 'Turn 2: Final Response Synthesis',
          type: 'reply',
          content: 'The 30-day annualized volatility index for MSFT is 22.8% based on 22 market trading sessions. Execution terminated cleanly within 1 cycle.',
        },
      ]);
      setReactRunning(false);
    }, 2200);
  };

  // --- 2. SecureSecret State ---
  const [secretInput, setSecretInput] = useState<string>('sk-proj-99A8b7c6D5e4F3g2H1_DEMO_SECRET');
  const [secretCreated, setSecretCreated] = useState<boolean>(true);
  const [secretDestroyed, setSecretDestroyed] = useState<boolean>(false);
  const [heapState, setHeapState] = useState<string[]>(secretInput.split(''));

  const handleCreateSecret = () => {
    setSecretCreated(true);
    setSecretDestroyed(false);
    setHeapState(secretInput.split(''));
  };

  const handleWipeSecret = () => {
    setSecretDestroyed(true);
    setHeapState(new Array(secretInput.length).fill('\\0'));
  };

  // --- 3. ContextCompactor State ---
  const [maxTokensBudget, setMaxTokensBudget] = useState<number>(140);
  const [conversation, setConversation] = useState<ChatMessage[]>([
    { id: '1', role: 'SYSTEM', content: 'You are the Lean Java Agentic Core under strict java.base execution rules.' },
    { id: '2', role: 'USER', content: 'Turn 1: Please explain the purpose of ProcessTreeTerminator.' },
    { id: '3', role: 'ASSISTANT', content: 'Turn 1: ProcessTreeTerminator traverses ProcessHandle.descendants() to destroy orphan child processes.' },
    { id: '4', role: 'USER', content: 'Turn 2: Why do standard Process.destroy() calls fail to kill child worker daemons?' },
    { id: '5', role: 'ASSISTANT', content: 'Turn 2: Standard destroy() only kills the immediate parent process, leaving subprocesses orphaned.' },
    { id: '6', role: 'USER', content: 'Turn 3: Can you demonstrate a code example?' },
  ]);

  const compactedMessages = compactHistory(conversation, maxTokensBudget);
  const rawTokens = estimateHistoryTokens(conversation);
  const compactedTokens = estimateHistoryTokens(compactedMessages);

  // --- 4. Environment Sanitizer State ---
  const [hostEnv, setHostEnv] = useState<Record<string, string>>({
    PATH: '/usr/local/bin:/usr/bin:/bin',
    USER: 'developer_node',
    TEMP: '/tmp/applet',
    AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
    AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    DATABASE_URL: 'postgres://admin:supersecret@10.0.0.5:5432/production',
    ANTHROPIC_API_KEY: 'sk-ant-api03-abcdef1234567890',
  });
  const [allowedEnvKeys, setAllowedEnvKeys] = useState<string[]>(['PATH', 'USER', 'TEMP']);
  const sanitizedEnv = sanitizeEnvironment(hostEnv, allowedEnvKeys);

  const toggleAllowKey = (key: string) => {
    if (allowedEnvKeys.includes(key)) {
      setAllowedEnvKeys(allowedEnvKeys.filter((k) => k !== key));
    } else {
      setAllowedEnvKeys([...allowedEnvKeys, key]);
    }
  };

  // --- 5. HCAT Simulator State ---
  const [hcatStep, setHcatStep] = useState<number>(0);
  const [hcatRunning, setHcatRunning] = useState<boolean>(false);
  const [hcatResults, setHcatResults] = useState<Array<{ layer: string; status: 'pass' | 'fail' | 'running'; message: string }>>([]);

  const runHcatLadder = () => {
    setHcatRunning(true);
    setHcatStep(1);
    setHcatResults([{ layer: 'L0: Deterministic Gates', status: 'running', message: 'Running tsc --noEmit, schema check, and JUnit 5 tests...' }]);

    setTimeout(() => {
      setHcatResults([
        { layer: 'L0: Deterministic Gates', status: 'pass', message: 'Compilation passed. 11/11 tests pass. Schema validated.' },
        { layer: 'L1: Worker Self-Check', status: 'running', message: 'Worker running local visible smoke test...' },
      ]);
      setHcatStep(2);
    }, 600);

    setTimeout(() => {
      setHcatResults((prev) => [
        prev[0],
        { layer: 'L1: Worker Self-Check', status: 'pass', message: 'Visible test suite exit code 0.' },
        { layer: 'L2: Cross-Family Peer Verifier', status: 'running', message: 'Cross-family verifier checking atomic criteria AC-1..AC-3...' },
      ]);
      setHcatStep(3);
    }, 1200);

    setTimeout(() => {
      setHcatResults((prev) => [
        prev[0],
        prev[1],
        { layer: 'L2: Cross-Family Peer Verifier', status: 'pass', message: 'Peer verifier confirms 3/3 criteria verified without family bias.' },
        { layer: 'L3: Independent QA Holdout', status: 'running', message: 'Black-box test generator executing hidden test suite...' },
      ]);
      setHcatStep(4);
    }, 1800);

    setTimeout(() => {
      setHcatResults((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { layer: 'L3: Independent QA Holdout', status: 'pass', message: 'Hidden suite passes. Zero silent mocks or confirmation bias.' },
        { layer: 'L5: Architect Acceptance', status: 'running', message: 'Architect verifying ledger evidence digest against frozen contract...' },
      ]);
      setHcatStep(5);
    }, 2400);

    setTimeout(() => {
      setHcatResults((prev) => [
        prev[0],
        prev[1],
        prev[2],
        prev[3],
        { layer: 'L5: Architect Acceptance', status: 'pass', message: 'Ledger verified (criterion -> disposition -> SHA-256 digest). Proposal approved!' },
      ]);
      setHcatRunning(false);
      setHcatStep(6);
    }, 3000);
  };

  // --- 6. Invariant Checkers State ---
  const [pinningSnippet, setPinningSnippet] = useState<string>(`// Code snippet for JDK 21 virtual thread safety check
public void processInference() {
  synchronized (streamLock) {
    streamLock.wait(100);
  }
}`);
  const pinningCheck = checkCarrierPinning(pinningSnippet);

  const [parentGuards, setParentGuards] = useState<string[]>([
    'GUARD_PATH_JAIL',
    'GUARD_CMD_INJECTION',
    'GUARD_TOKEN_BUDGET',
    'GUARD_SECRET_MASK',
  ]);
  const [candidateGuards, setCandidateGuards] = useState<string[]>([
    'GUARD_PATH_JAIL',
    'GUARD_CMD_INJECTION',
    'GUARD_TOKEN_BUDGET',
  ]);
  const [grantSigned, setGrantSigned] = useState<boolean>(false);
  const monotonicityCheck = checkProtectionInventoryMonotonicity(
    parentGuards,
    candidateGuards,
    grantSigned ? ['GUARD_SECRET_MASK'] : []
  );

  const [mcpCmd, setMcpCmd] = useState<string>('node mcp-server.js; rm -rf /');
  const mcpCheck = validateMcpDescriptor({ command: mcpCmd });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Simulator Header */}
      <div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Interactive Architectural Mechanics
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Apex Agentic Core & Safety Invariant Simulators
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          Verify runtime mechanics: autonomous ReAct loops, deterministic credential scrubbing, sliding-window token compaction, HCAT verification ladders, and 2026 safety invariants (K8, E6, M1).
        </p>
      </div>

      {/* Simulator Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('hcat')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'hcat'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          1. HCAT Verification Ladder (L0–L5)
        </button>
        <button
          onClick={() => setActiveTab('invariants')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'invariants'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          2. 2026 Invariant Checkers (K8 / E6 / M1)
        </button>
        <button
          onClick={() => setActiveTab('react')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'react'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          3. ReAct Cognitive Loop
        </button>
        <button
          onClick={() => setActiveTab('secret')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'secret'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          4. SecureSecret Memory Scrubbing
        </button>
        <button
          onClick={() => setActiveTab('compactor')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'compactor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          5. ContextCompactor
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          6. EnvironmentSanitizer
        </button>
      </div>

      {/* --- HCAT Verification Ladder Simulator --- */}
      {activeTab === 'hcat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span>Hierarchical Coding Agent Tree (HCAT) Ladder</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Dispatches a task against a frozen acceptance contract and passes through the 6-layer defense-in-depth verification ladder.
              </p>
            </div>
            <button
              onClick={runHcatLadder}
              disabled={hcatRunning}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>{hcatRunning ? 'Evaluating Ladder...' : 'Dispatch HCAT Task'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frozen Contract View */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Frozen Acceptance Contract (FAC-1)</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                <div className="text-indigo-400 font-bold">{SAMPLE_HANDOFF_ENVELOPE.task_id}</div>
                <div className="text-slate-300">{SAMPLE_HANDOFF_ENVELOPE.objective}</div>
                <div className="border-t border-slate-800/80 pt-2 text-slate-400">
                  <div className="font-semibold text-slate-300 mb-1">Acceptance Criteria (Binary Pass/Fail):</div>
                  {SAMPLE_HANDOFF_ENVELOPE.acceptance_criteria.map((c) => (
                    <div key={c.id} className="text-slate-400 text-[11px]">
                      <span className="text-emerald-400 font-bold">{c.id}: </span>
                      {c.criterion}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Budget: {SAMPLE_HANDOFF_ENVELOPE.budget.steps} steps · ${SAMPLE_HANDOFF_ENVELOPE.budget.cost_usd} ceiling
                </div>
              </div>
            </div>

            {/* Verification Execution Stream */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Verification Gate Ledger</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2.5 min-h-[220px]">
                {hcatResults.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-8 text-center">
                    Click "Dispatch HCAT Task" to execute the verification ladder.
                  </div>
                ) : (
                  hcatResults.map((r, i) => (
                    <div key={i} className="text-xs p-2.5 rounded bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                      {r.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{r.layer}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{r.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2026 Invariant Checkers Simulator --- */}
      {activeTab === 'invariants' && (
        <div className="space-y-6">
          {/* Invariant K8: Carrier Pinning Scanner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">INVARIANT K8 (2026 Ecosystem Remediation)</span>
                <h3 className="text-base font-bold text-white mt-0.5">Virtual-Thread Carrier Pinning Static Scanner</h3>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                pinningCheck.isPinned
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {pinningCheck.isPinned ? 'K8 VIOLATION DETECTED' : 'K8 COMPLIANT'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              On JDK 21, virtual threads executing inside <code className="text-rose-300">synchronized</code> blocks or calling <code className="text-rose-300">Object.wait()</code> pin OS carrier threads. The agent executor strictly bans them in favor of <code className="text-emerald-300">ReentrantLock</code> and <code className="text-emerald-300">Condition.await()</code>.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5">Test Java Code:</div>
                <textarea
                  value={pinningSnippet}
                  onChange={(e) => setPinningSnippet(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setPinningSnippet(`// Safe ReentrantLock pattern\npublic void executeTask() {\n  reentrantLock.lock();\n  try {\n    condition.await();\n  } finally {\n    reentrantLock.unlock();\n  }\n}`)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 cursor-pointer"
                >
                  Load Safe ReentrantLock Pattern
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                <div className="font-semibold text-slate-300">Scanner Verdict:</div>
                {pinningCheck.violations.length === 0 ? (
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zero carrier pinning hazards. Clean unmounting guaranteed on JDK 21.</span>
                  </div>
                ) : (
                  pinningCheck.violations.map((v, i) => (
                    <div key={i} className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-rose-300">
                      <div className="font-mono text-[11px] font-bold">Line {v.line}: {v.text}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{v.reason}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Invariant E6: Protection Inventory Monotonicity */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400">INVARIANT E6 (Anti-Masked Erosion)</span>
                <h3 className="text-base font-bold text-white mt-0.5">Protection Inventory Monotonicity Diff Gate</h3>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                monotonicityCheck.isMonotonic
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {monotonicityCheck.isMonotonic ? 'E6 MONOTONIC PASS' : 'E6 REJECTED: MASKED EROSION'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Acceptance gates that score purely on task success silently allow overlapping redundant safeguards to be removed. Invariant E6 diffs active guardrails and rejects deletions lacking an explicit signed operator grant.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-slate-300">Parent Commit Guardrails:</div>
                {parentGuards.map((g) => (
                  <div key={g} className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-slate-300">Candidate Commit Guardrails:</div>
                {candidateGuards.map((g) => (
                  <div key={g} className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>{g}</span>
                  </div>
                ))}
                <div className="text-[11px] text-rose-400 pt-1">
                  Missing: GUARD_SECRET_MASK
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
                <div className="font-semibold text-slate-300">Operator Permission Grant:</div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={grantSigned}
                    onChange={(e) => setGrantSigned(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Signed Grant for GUARD_SECRET_MASK removal</span>
                </label>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  {monotonicityCheck.isMonotonic ? (
                    <span className="text-emerald-400 font-semibold">Commit Allowed. Removal authorized by signed operator grant.</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Commit Blocked. Unauthorized safeguard reduction detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invariant M1: MCP Descriptor Validator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">INVARIANT M1 (MCP RCE Defense)</span>
                <h3 className="text-base font-bold text-white mt-0.5">MCP Descriptor Pre-Instantiation Validator</h3>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                mcpCheck.valid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {mcpCheck.valid ? 'M1 DESCRIPTOR VALID' : 'M1 REJECTED'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Official MCP SDK STDIO config vulnerabilities allow arbitrary OS commands. Apex validates descriptors against binary allowlists and blocks shell metacharacters before client creation.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">MCP Tool Descriptor Command:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mcpCmd}
                  onChange={(e) => setMcpCmd(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setMcpCmd('node mcp-server.js')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Safe Command
                </button>
              </div>
              {!mcpCheck.valid && (
                <div className="text-xs text-rose-400 font-mono mt-1">
                  Blocked: {mcpCheck.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 1. ReAct Cognitive Loop Simulator --- */}
      {activeTab === 'react' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>ReAct Loop Engine Simulator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Observes the cyclic Thought -&gt; Action -&gt; Observation cognitive cycle without external network latency.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={reactEngine}
                onChange={(e) => setReactEngine(e.target.value as 'ts' | 'python')}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="ts">TypeScript Runner (Deno Sandbox)</option>
                <option value="python">Python Runner (python3 -B -u)</option>
              </select>
              <button
                onClick={runReactSim}
                disabled={reactRunning}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>{reactRunning ? 'Executing...' : 'Run Autonomous Loop'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Simulated Agent Objective:</label>
            <input
              type="text"
              value={reactQuery}
              onChange={(e) => setReactQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Event Stream Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Engine Execution Trace:</span>
              <span className="font-mono text-[11px]">Hard Turn Limit: 10 max iterations</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3 min-h-[180px]">
              {reactEvents.length === 0 ? (
                <div className="text-slate-500 italic py-8 text-center">
                  Press "Run Autonomous Loop" to trace the cognitive execution cycle.
                </div>
              ) : (
                reactEvents.map((ev, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[11px] text-slate-500 font-semibold">{ev.step}</div>
                    <div
                      className={`p-2.5 rounded border leading-relaxed ${
                        ev.type === 'thought'
                          ? 'bg-blue-950/20 border-blue-900/40 text-blue-300'
                          : ev.type === 'action'
                          ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                          : ev.type === 'observation'
                          ? 'bg-purple-950/20 border-purple-900/40 text-purple-300'
                          : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 font-bold'
                      }`}
                    >
                      {ev.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 2. SecureSecret Memory Scrubbing Demo --- */}
      {activeTab === 'secret' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>SecureSecret Memory Scrubbing Inspector</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Demonstrates why immutable Java Strings leak credentials in heap memory and how SecureSecret wipes char[] buffers with null bytes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Sensitive Secret Input:</label>
                <input
                  type="text"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateSecret}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                >
                  Allocate in char[] Buffer
                </button>
                <button
                  onClick={handleWipeSecret}
                  className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Execute AutoCloseable.close()</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-300">Memory Security Invariant:</div>
                <div>State: {secretDestroyed ? 'WIPED (Destroyed)' : 'ACTIVE (In Memory)'}</div>
                <div>Post-Close Access: {secretDestroyed ? 'Throws IllegalStateException' : 'Permitted'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Simulated Heap Memory Representation:</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs flex flex-wrap gap-1.5 min-h-[140px] items-center content-start">
                {heapState.map((ch, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-1 rounded text-center min-w-[24px] text-[11px] font-bold ${
                      ch === '\\0'
                        ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                        : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40'
                    }`}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. TokenEstimator & ContextCompactor --- */}
      {activeTab === 'compactor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>TokenEstimator & ContextCompactor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sliding-window compaction algorithm preserving SYSTEM prompt at index 0 while pruning oldest user/assistant turns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Budget Limit:</span>
              <input
                type="number"
                value={maxTokensBudget}
                onChange={(e) => setMaxTokensBudget(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Original Conversational History:</span>
                <span className="font-mono text-slate-400">{rawTokens} Tokens</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-[300px] overflow-y-auto">
                {conversation.map((m) => (
                  <div key={m.id} className="text-xs p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="font-bold text-indigo-400 font-mono uppercase text-[10px]">{m.role}: </span>
                    <span className="text-slate-300">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400">Compacted Output:</span>
                <span className="font-mono text-emerald-400 font-bold">{compactedTokens} / {maxTokensBudget} Tokens</span>
              </div>
              <div className="bg-slate-950 border border-emerald-900/40 rounded-lg p-3 space-y-2 max-h-[300px] overflow-y-auto">
                {compactedMessages.map((m) => (
                  <div key={m.id} className="text-xs p-2 rounded bg-emerald-950/20 border border-emerald-800/30">
                    <span className="font-bold text-emerald-400 font-mono uppercase text-[10px]">{m.role}: </span>
                    <span className="text-slate-200">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. EnvironmentSanitizer Sandbox --- */}
      {activeTab === 'sandbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span>EnvironmentSanitizer Process Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guarantees strict environment allowlist enforcement so guest processes never inherit host secrets or sensitive API credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Host Environment Map</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs max-h-[280px] overflow-y-auto">
                {Object.entries(hostEnv).map(([key, val]) => {
                  const isAllowed = allowedEnvKeys.includes(key);
                  const isDangerous = key.includes('KEY') || key.includes('SECRET') || key.includes('URL');
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded border flex items-center justify-between gap-2 ${
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
