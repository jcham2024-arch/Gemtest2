import { test } from 'node:test';
import assert from 'node:assert';
import { 
  validateJsonDepth, 
  parseTaskContract, 
  serializeTaskContract, 
  TaskContractDto 
} from './jsonCodec.js';

test('validateJsonDepth accepts standard JSON and rejects deep nesting', () => {
  const shallow = '{"a": {"b": [1, 2, 3]}}';
  assert.strictEqual(validateJsonDepth(shallow), true);

  // Deep nesting > 64 levels
  const deep = '['.repeat(65) + '1' + ']'.repeat(65);
  assert.throws(() => validateJsonDepth(deep, 64), RangeError);
});

test('TaskContract serialization and parsing round-trips accurately', () => {
  const original: TaskContractDto = {
    taskId: 'task-test-01',
    agentId: 'ast_slicer',
    callerId: 'lead_operator',
    intentDescription: 'Prune AST nodes down to 100 LOC',
    toolAllowlist: ['ast_slicer.ts', 'ast_patcher.ts'],
    targetPaths: ['src/workbench/types.ts'],
    timeoutMs: 15000,
    budgetLimitTokens: 2048,
    status: 'IN_PROGRESS'
  };

  const serialized = serializeTaskContract(original);
  const deserialized = parseTaskContract(serialized);

  assert.strictEqual(deserialized.taskId, original.taskId);
  assert.strictEqual(deserialized.agentId, original.agentId);
  assert.deepStrictEqual(deserialized.toolAllowlist, original.toolAllowlist);
  assert.strictEqual(deserialized.status, 'IN_PROGRESS');
});
