import { ChatMessage, HandoffEnvelope, ResultContract } from '../types/architecture';

/**
 * Default character to token heuristic for LLM context estimation (~3.8 to 4.0 chars/token).
 */
export const DEFAULT_CHARS_PER_TOKEN = 3.8;

/**
 * Calculates estimated tokens with a 10% safety margin.
 */
export function estimateTokens(text: string, charsPerToken = DEFAULT_CHARS_PER_TOKEN): number {
  if (!text || text.length === 0) return 0;
  const rawTokens = Math.ceil(text.length / charsPerToken);
  // Add 10% safety margin for sub-word tokenization boundaries
  return Math.ceil(rawTokens * 1.1);
}

/**
 * Calculates the total estimated tokens across all conversational turns.
 */
export function estimateHistoryTokens(
  messages: ChatMessage[],
  charsPerToken = DEFAULT_CHARS_PER_TOKEN
): number {
  if (!messages || messages.length === 0) return 0;
  return messages.reduce((total, msg) => {
    let msgChars = (msg.content || '').length + 10; // metadata overhead
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      msgChars += msg.toolCalls.reduce((tcTotal, tc) => {
        return tcTotal + tc.functionName.length + (tc.argumentsJson || '').length + 20;
      }, 0);
    }
    return total + estimateTokens('x'.repeat(msgChars), charsPerToken);
  }, 0);
}

/**
 * Applies sliding-window history pruning:
 * Always preserves SYSTEM messages at the start of the conversation.
 * Prunes the oldest non-SYSTEM turns until total tokens fall within maxAllowedTokens.
 */
export function compactHistory(
  messages: ChatMessage[],
  maxAllowedTokens: number,
  charsPerToken = DEFAULT_CHARS_PER_TOKEN
): ChatMessage[] {
  if (!messages || messages.length === 0) return [];

  const systemMessages = messages.filter((m) => m.role === 'SYSTEM');
  let nonSystemMessages = messages.filter((m) => m.role !== 'SYSTEM');

  const systemTokens = estimateHistoryTokens(systemMessages, charsPerToken);
  const remainingBudget = Math.max(0, maxAllowedTokens - systemTokens);

  while (
    nonSystemMessages.length > 0 &&
    estimateHistoryTokens(nonSystemMessages, charsPerToken) > remainingBudget
  ) {
    // Prune the oldest non-system message
    nonSystemMessages = nonSystemMessages.slice(1);
  }

  return [...systemMessages, ...nonSystemMessages];
}

/**
 * Filters process environment variables using an explicit allowlist.
 * Blocks sensitive keys (e.g., AWS_SECRET_KEY, DATABASE_URL) from child scripts.
 */
export function sanitizeEnvironment(
  sourceEnv: Record<string, string>,
  allowedKeys: string[] = ['PATH', 'TEMP', 'TMP', 'USER']
): Record<string, string> {
  const cleanEnv: Record<string, string> = {};
  const allowSet = new Set(allowedKeys.map((k) => k.toUpperCase()));

  for (const [key, value] of Object.entries(sourceEnv)) {
    if (allowSet.has(key.toUpperCase())) {
      cleanEnv[key] = value;
    }
  }

  return Object.freeze(cleanEnv) as Record<string, string>;
}

/**
 * Calculates overall progress and counts for milestone steps or phases.
 */
export function calculateMilestoneProgress(steps: Array<{ status: string }>): {
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
  percentage: number;
} {
  const total = steps.length;
  if (total === 0) {
    return { completed: 0, inProgress: 0, pending: 0, total: 0, percentage: 0 };
  }

  const completed = steps.filter((s) => s.status === 'completed').length;
  const inProgress = steps.filter((s) => s.status === 'in_progress').length;
  const pending = steps.filter((s) => s.status === 'pending').length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, inProgress, pending, total, percentage };
}

/**
 * Validates a Handoff Envelope against schema rules and authority attenuation invariants.
 */
export function validateHandoffEnvelope(
  envelope: Partial<HandoffEnvelope>,
  parentAllowedTools?: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!envelope.handoff_id) errors.push('Missing handoff_id');
  if (!envelope.task_id) errors.push('Missing task_id');
  if (!envelope.worker_role) errors.push('Missing worker_role');
  if (!envelope.objective || envelope.objective.trim() === '') errors.push('Missing objective');

  if (!envelope.acceptance_criteria || envelope.acceptance_criteria.length === 0) {
    errors.push('Envelope must contain at least one acceptance criterion');
  }

  if (!envelope.budget || envelope.budget.steps <= 0 || envelope.budget.cost_usd <= 0) {
    errors.push('Budget must declare steps > 0 and cost_usd > 0');
  }

  // Authority attenuation invariant: child.allowed_tools ⊆ parent.allowed_tools
  if (parentAllowedTools && envelope.allowed_tools) {
    const parentSet = new Set(parentAllowedTools);
    for (const tool of envelope.allowed_tools) {
      if (!parentSet.has(tool)) {
        errors.push(`Tool authority escalation: '${tool}' not granted in parent envelope`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a ResultContract returned from an executor agent.
 */
export function validateResultContract(result: Partial<ResultContract>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const allowedStatuses = ['completed', 'partial', 'blocked', 'failed'];

  if (!result.status || !allowedStatuses.includes(result.status)) {
    errors.push(`Invalid status: ${result.status}. Must be one of ${allowedStatuses.join(', ')}`);
  }

  if (!result.criteria || !Array.isArray(result.criteria)) {
    errors.push('ResultContract must contain criteria dispositions array');
  } else {
    for (const c of result.criteria) {
      if (!c.id) errors.push('Criterion missing id');
      const isPass = c.disposition === 'pass';
      const isFail = c.disposition === 'fail';
      const isSkipped = typeof c.disposition === 'string' && c.disposition.startsWith('skipped:');
      if (!isPass && !isFail && !isSkipped) {
        errors.push(`Criterion ${c.id} disposition must be pass, fail, or skipped:<reason>`);
      }
      if (c.disposition === 'pass' && !c.evidence_digest) {
        errors.push(`Criterion ${c.id} passed without an evidence_digest`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Invariant K8: Detects JDK 21 carrier-pinning hazards (synchronized blocks or Object.wait).
 */
export function checkCarrierPinning(sourceCode: string): {
  isPinned: boolean;
  violations: Array<{ line: number; text: string; reason: string }>;
} {
  const violations: Array<{ line: number; text: string; reason: string }> = [];
  const lines = sourceCode.split('\n');

  lines.forEach((line, index) => {
    // Strip comments
    const trimmed = line.split('//')[0].trim();
    if (/\bsynchronized\s*\(/.test(trimmed) || /\bpublic\s+synchronized\b/.test(trimmed)) {
      violations.push({
        line: index + 1,
        text: line.trim(),
        reason: 'synchronized block/method pins virtual threads to OS carrier thread on JDK 21 (Invariant K8)',
      });
    }
    if (/\.wait\s*\(/.test(trimmed)) {
      violations.push({
        line: index + 1,
        text: line.trim(),
        reason: 'Object.wait() pins virtual threads to OS carrier thread on JDK 21 (Invariant K8)',
      });
    }
  });

  return {
    isPinned: violations.length > 0,
    violations,
  };
}

/**
 * Invariant E6: Protection inventory monotonicity check (Anti-Masked Erosion).
 * Candidate cannot delete active guardrail IDs without an explicit signed operator grant.
 */
export function checkProtectionInventoryMonotonicity(
  parentGuardrails: string[],
  candidateGuardrails: string[],
  signedGrantRemovedGuardrails: string[] = []
): {
  isMonotonic: boolean;
  unauthorizedDeletions: string[];
} {
  const candidateSet = new Set(candidateGuardrails);
  const authorizedDeletions = new Set(signedGrantRemovedGuardrails);
  const unauthorizedDeletions: string[] = [];

  for (const guard of parentGuardrails) {
    if (!candidateSet.has(guard)) {
      if (!authorizedDeletions.has(guard)) {
        unauthorizedDeletions.push(guard);
      }
    }
  }

  return {
    isMonotonic: unauthorizedDeletions.length === 0,
    unauthorizedDeletions,
  };
}

/**
 * Invariant M1: Validates MCP tool descriptors against tenant capability grant and allowlist.
 */
export function validateMcpDescriptor(
  descriptor: {
    command?: string;
    path?: string;
    env?: Record<string, string>;
  },
  binaryAllowlist: string[] = ['node', 'git', 'deno', 'bun', 'python3']
): { valid: boolean; error?: string } {
  if (descriptor.command) {
    const baseCommand = descriptor.command.trim().split(/\s+/)[0];
    // Check metacharacters
    if (/[;&|`$><]/.test(descriptor.command)) {
      return { valid: false, error: 'Command contains shell metacharacters (Invariant M1)' };
    }
    // Check binary allowlist
    const matched = binaryAllowlist.some((allowed) =>
      baseCommand === allowed || baseCommand.endsWith(`/${allowed}`)
    );
    if (!matched) {
      return { valid: false, error: `Command '${baseCommand}' is not in the binary allowlist (Invariant M1)` };
    }
  }

  if (descriptor.path) {
    // Relative path check or path traversal
    if (descriptor.path.includes('..') || descriptor.path.startsWith('/etc') || descriptor.path.startsWith('/bin')) {
      return { valid: false, error: `Path traversal or system path outside workspace rejected (Invariant M1)` };
    }
  }

  return { valid: true };
}
