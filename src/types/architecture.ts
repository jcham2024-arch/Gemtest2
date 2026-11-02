export type ViewMode = 
  | 'roadmap' 
  | 'architecture' 
  | 'pojos' 
  | 'wiki' 
  | 'simulator'
  | 'workbench';

export type PlaneType = 'kernel' | 'evolution' | 'plugin' | 'client' | 'automation';

export interface MilestoneStep {
  step: number;
  task: string;
  details: string;
  phaseId: number;
  tokenBudget: number;
  targetArtifacts: string[];
  acceptanceCriteria: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ImplementationPhase {
  id: number;
  code: string; // 'P1'..'P10'
  name: string;
  title: string;
  summary: string;
  plane: PlaneType;
  salvageTag?: string; // '[SALVAGE: LeanJavallm]' | '[SALVAGE: Agenticplatformsetup]'
  estimatedWeeks: string;
  prerequisites: number[];
  deliverables: string[];
  verificationCriteria: string[];
  steps: MilestoneStep[];
  subsystemsInvolved: string[];
  riskFactor: 'Low' | 'Medium' | 'High';
  riskMitigation: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface SafetyInvariant {
  id: string; // 'K1'..'K8', 'E1'..'E6', 'M1'..'M2', 'C1'..'C6'
  plane: PlaneType;
  title: string;
  statement: string;
  test: string;
  failureCode?: string;
  yearAdded?: number; // e.g. 2026 for K8, E6, M1, M2, C5, C6
  threatCategory: string;
}

export interface CorePort {
  id: string;
  name: string;
  interfaceName: string;
  tier: 'Tier 0 Pure' | 'Tier 1 JDK' | 'Tier 2 Spring/Google';
  purpose: string;
  adapterImplementation: string;
  methodSignatures: string[];
  isTested: boolean;
}

export interface VerificationLayer {
  id: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  name: string;
  modelTier: 'none' | 'cheap' | 'mid' | 'frontier';
  cost: 'near-zero' | 'low' | 'moderate' | 'moderate-high' | 'high';
  authority: string;
  catches: string;
  rule: string;
}

export interface HandoffEnvelope {
  handoff_id: string;
  parent_run_id: string;
  task_id: string;
  from_agent: string;
  to_agent: string;
  worker_role: string;
  objective: string;
  acceptance_criteria: Array<{ id: string; criterion: string }>;
  constraints: string[];
  allowed_tools: string[];
  budget: {
    steps: number;
    time_ms: number;
    cost_usd: number;
  };
  deadline: string;
  authority_digest: string;
}

export interface ResultContract {
  status: 'completed' | 'partial' | 'blocked' | 'failed';
  criteria: Array<{
    id: string;
    disposition: 'pass' | 'fail' | `skipped:${string}`;
    evidence_digest: string;
  }>;
  changed_files: string[];
  unresolved: string[];
  verification: {
    commands_run: string[];
    results: Array<'pass' | 'fail' | `skipped:${string}`>;
  };
}

export interface PojoField {
  name: string;
  type: string;
  description: string;
  isPrivate?: boolean;
}

export interface PojoMethod {
  signature: string;
  behavior: string;
  returnType?: string;
}

export interface PojoSpecification {
  className: string;
  packageName: string;
  type: 'class' | 'record' | 'interface' | 'enum' | 'abstract class';
  locTarget: string;
  actualLocEstimate: number;
  category: string;
  purpose: string;
  whyWeNeedIt: string;
  securityAndEnterpriseNotes: string;
  fieldsToImplement: PojoField[];
  methodsToImplement: PojoMethod[];
  instructionForGeneratingAgent: string;
  javaCodeTemplate: string;
  relatedWiki: string;
  isApexNative?: boolean;
  salvageSource?: string;
}

export interface Subsystem {
  id: string;
  name: string;
  layer: number;
  plane?: PlaneType;
  description: string;
  keyMechanisms: string[];
  associatedPojos: string[];
  securityRole: string;
}

export interface CriticalGap {
  id: string;
  title: string;
  gap: string;
  impact: string;
  remediation: string;
  remediedByPojo: string;
  threatSeverity: 'Critical' | 'High' | 'Medium';
  cveReference?: string;
  beforeLogic: string;
  afterLogic: string;
}

export interface WikiPage {
  file: string;
  id: string;
  title: string;
  type: string;
  module: string;
  contextCost: number;
  tags: string[];
  relatedLinks: string[];
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'SYSTEM' | 'USER' | 'ASSISTANT' | 'TOOL';
  content: string;
  toolCallId?: string;
  toolCalls?: Array<{ id: string; functionName: string; argumentsJson: string }>;
}
