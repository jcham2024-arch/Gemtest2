export type ViewMode = 
  | 'roadmap' 
  | 'architecture' 
  | 'pojos' 
  | 'wiki' 
  | 'simulator'
  | 'workbench';

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
  name: string;
  title: string;
  summary: string;
  estimatedWeeks: string;
  prerequisites: number[];
  deliverables: string[];
  verificationCriteria: string[];
  steps: MilestoneStep[];
  subsystemsInvolved: string[];
  riskFactor: 'Low' | 'Medium' | 'High';
  riskMitigation: string;
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
}

export interface Subsystem {
  id: string;
  name: string;
  layer: number;
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
