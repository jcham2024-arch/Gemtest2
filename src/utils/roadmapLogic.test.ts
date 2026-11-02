import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateTokens,
  estimateHistoryTokens,
  compactHistory,
  sanitizeEnvironment,
  calculateMilestoneProgress,
} from './roadmapLogic';
import { ChatMessage } from '../types/architecture';

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
