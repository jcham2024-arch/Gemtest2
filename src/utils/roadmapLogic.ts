import { ChatMessage } from '../types/architecture';

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
 * Calculates overall progress and counts for milestone steps.
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
