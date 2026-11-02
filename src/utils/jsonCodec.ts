/**
 * Pure TypeScript RFC 8259 JSON validator and AgentForge TaskContract Codec.
 * Mirrors com.leanllm.json and com.leanllm.agentforge for the standalone UI module.
 */

export interface TaskContractDto {
  taskId: string;
  agentId: string;
  callerId: string;
  intentDescription: string;
  toolAllowlist: string[];
  targetPaths: string[];
  timeoutMs: number;
  budgetLimitTokens: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TERMINATED_TIMEOUT';
}

export interface ExecutionArtifactDto {
  artifactId: string;
  taskId: string;
  relativePath: string;
  contentDigest: string;
  sizeBytes: number;
  verified: boolean;
}

export const MAX_RECURSION_DEPTH = 64;

/**
 * Validates that raw JSON conforms to RFC 8259 and defends against CWE-674 recursion limits.
 */
export function validateJsonDepth(rawJson: string, maxDepth = MAX_RECURSION_DEPTH): boolean {
  let currentDepth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < rawJson.length; i++) {
    const char = rawJson[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\' && inString) {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        currentDepth++;
        if (currentDepth > maxDepth) {
          throw new RangeError(`Max recursion depth (${maxDepth}) exceeded (CWE-674 defense)`);
        }
      } else if (char === '}' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
  }
  return true;
}

/**
 * Serializes a TaskContract DTO to a normalized JSON string.
 */
export function serializeTaskContract(contract: TaskContractDto): string {
  return JSON.stringify(contract, null, 2);
}

/**
 * Safely parses and validates a TaskContract DTO.
 */
export function parseTaskContract(rawJson: string): TaskContractDto {
  validateJsonDepth(rawJson);
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== 'object') {
    throw new TypeError('Invalid JSON: Root must be an object');
  }
  if (!parsed.taskId || !parsed.agentId || !parsed.intentDescription) {
    throw new TypeError('Missing mandatory TaskContract fields (taskId, agentId, intentDescription)');
  }
  return {
    taskId: String(parsed.taskId),
    agentId: String(parsed.agentId),
    callerId: String(parsed.callerId || 'operator'),
    intentDescription: String(parsed.intentDescription),
    toolAllowlist: Array.isArray(parsed.toolAllowlist) ? parsed.toolAllowlist.map(String) : [],
    targetPaths: Array.isArray(parsed.targetPaths) ? parsed.targetPaths.map(String) : [],
    timeoutMs: Number(parsed.timeoutMs) || 30000,
    budgetLimitTokens: Number(parsed.budgetLimitTokens) || 4096,
    status: parsed.status || 'PENDING'
  };
}
