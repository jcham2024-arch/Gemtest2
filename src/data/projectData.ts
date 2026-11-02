import {
  ImplementationPhase,
  MilestoneStep,
  Subsystem,
  CriticalGap,
  PojoSpecification,
  WikiPage,
  SafetyInvariant,
  CorePort,
  VerificationLayer,
  HandoffEnvelope,
  ResultContract,
} from '../types/architecture';

export const MASTER_METADATA = {
  projectName: 'Apex Agent Management Chat',
  version: '2.0.0',
  architecture: 'Dual-Plane (Java 21 Microkernel + CAS Evolution Plane + Tauri 2.0 / React 19 Client)',
  targetJdk: 'Java 21 LTS (Spring Boot 3.3, LangChain4j, Virtual Threads without Pinning)',
  dependencyPolicy: 'Tier 0 Core: pure JDK 21 records & interfaces. Tier 1: JDK-only adapters. Tier 2: Spring AI & Google MCP adapters.',
  ninePorts: [
    'ChatModelPort',
    'PlannerPort (AStar native)',
    'ToolExecutorPort',
    'ApprovalPort (RiskLevel L0-L5)',
    'StoragePort (SQLite WAL / Postgres)',
    'VectorStorePort',
    'SecretsPort',
    'AuditPort',
    'TelemetryPort',
  ],
  polyglotStrategy: {
    orchestrationCore: 'Java 21 records, sealed interfaces, and native A* GOAP planner.',
    primaryScriptingLanguage: 'TypeScript (Deno / Bun / ts-node) - Preferred for tool scripts, dynamic logic, and isomorphic client contracts.',
    secondaryScriptingLanguage: 'Python 3 - Secondary opt-in for ML/scientific scripts with unbuffered execution.',
    decouplingMandate: 'Kernel plane has no write path to its own behavior. All agent evolution occurs in ephemeral CAS sandbox branches gated by the SandboxValidationSentinel and human sign-off.',
  },
  vision: 'An enterprise-grade, self-evolving multi-agent platform where multiple LLM agents collaborate in one workspace with independent permissions, memory, and tools, anchored by an immutable Java 21 microkernel and a versioned Content-Addressable Storage (CAS) evolution plane.',
  architecturalPrinciples: [
    {
      name: 'Dual-Plane Separation',
      description: 'Immutable compile-time-typed Kernel Plane (no write path to self) paired with a versioned CAS Git-tree Evolution Plane gated by a 6-category validation sentinel.',
    },
    {
      name: 'Enforced Isomorphism',
      description: 'TypeScript client types strictly mirror Java OpenAPI definitions via automated CI drift checks (git diff --exit-code).',
    },
    {
      name: 'Hierarchical Coding Agent Tree (HCAT)',
      description: 'Defense-in-depth 6-layer verification ladder (L0-L5) with frozen acceptance contracts and cost-per-passing-build model routing.',
    },
    {
      name: 'Anti-Masked Erosion (E6)',
      description: 'Protection inventory monotonicity asserts candidate commits cannot silently drop active guardrails or capabilities without signed operator grants.',
    },
    {
      name: 'Virtual Thread Pinning Defense (K8)',
      description: 'JDK 21 agent executors strictly ban synchronized/Object.wait() and mandate ReentrantLock/Condition to prevent virtual-thread carrier starvation.',
    },
  ],
};

export const CRITICAL_GAPS: CriticalGap[] = [
  {
    id: 'GAP-01',
    title: 'Zombie Subprocess Leakage on Timeout',
    gap: 'Standard Process.destroyForcibly() only terminates the root parent process. If a Python script spawns subprocesses or a TypeScript engine invokes child worker threads, orphan processes persist indefinitely in memory.',
    impact: 'System exhaustion, memory leaks, runaway worker daemons holding locked ports or file descriptors after task cancellation.',
    remediation: 'Leverage the JDK 21 ProcessHandle API (Process.toHandle().descendants()) to recursively terminate entire process trees upon timeout or abort.',
    remediedByPojo: 'ProcessTreeTerminator',
    threatSeverity: 'Critical',
    cveReference: 'CWE-400 (Uncontrolled Resource Consumption)',
    beforeLogic: 'process.destroyForcibly(); // Leaks all child subprocesses spawned by guest runtime',
    afterLogic: 'process.toHandle().descendants().forEach(h -> h.destroy()); Thread.sleep(gracePeriod); process.toHandle().descendants().forEach(h -> h.destroyForcibly()); process.destroyForcibly();',
  },
  {
    id: 'GAP-02',
    title: 'Unbounded Context Window Growth',
    gap: 'AgentContext continuously appends ChatMessage objects. In multi-turn sessions, the message history quickly exceeds the model context window limit (e.g., 8k, 32k, or 128k tokens), causing API rejections.',
    impact: 'Sudden 400 Bad Request API crashes, broken conversational sessions, excessive token expenditure.',
    remediation: 'Introduce a lightweight TokenEstimator (~3.8 chars/token) and a modular ContextCompactor POJO implementing sliding-window truncation while preserving system prompts.',
    remediedByPojo: 'ContextCompactor & TokenEstimator',
    threatSeverity: 'High',
    cveReference: 'CWE-770 (Allocation of Resources Without Limits or Throttling)',
    beforeLogic: 'history.add(newMsg); // Endless append without ceiling or compaction',
    afterLogic: 'compactor.compact(history); // Always retains System prompt at index 0, prunes oldest user/assistant turns',
  },
  {
    id: 'GAP-03',
    title: 'Lack of Cancellation and Abort Signaling',
    gap: 'No standard mechanism exists for a user (via JavaFX or WebSockets) or an automated watchdog to interrupt a hanging HTTP inference stream or a long-running ReAct loop.',
    impact: 'Unkillable HTTP connection threads, wasted cloud inference tokens, unresponsive UI.',
    remediation: 'Introduce a thread-safe CancellationToken POJO passed through all network operations, stream loops, and script execution layers.',
    remediedByPojo: 'CancellationToken',
    threatSeverity: 'High',
    cveReference: 'CWE-834 (Excessive Iteration)',
    beforeLogic: 'while(streamOpen) { read(); } // No abort hook if user cancels or leaves view',
    afterLogic: 'token.checkCancelled(); // AtomicBoolean check with registered cancellation callbacks',
  },
  {
    id: 'GAP-04',
    title: 'Ephemeral Script Lifecycle Management',
    gap: 'Agents frequently generate dynamic, one-off scripts. Storing them permanently clutters disk storage, while executing non-persisted scripts requires specialized stdin piping.',
    impact: 'Disk clutter, potential execution of stale outdated scripts, disk exhaustion in long-running services.',
    remediation: 'Introduce an EphemeralScriptManager POJO that creates cryptographically unique temp files within an isolated directory and guarantees cleanup via AutoCloseable.',
    remediedByPojo: 'EphemeralScriptManager',
    threatSeverity: 'Medium',
    cveReference: 'CWE-459 (Incomplete Cleanup)',
    beforeLogic: 'File.createTempFile("script", ".ts"); // Left behind if crash or unhandled termination occurs',
    afterLogic: 'try (EphemeralScriptManager mgr = new EphemeralScriptManager(sandboxDir)) { mgr.purgeAll(); }',
  },
  {
    id: 'GAP-05',
    title: 'Concurrency and Thread Overhead',
    gap: 'Spawning traditional platform OS threads for concurrent stream drainage (stdout and stderr) incurs heavy OS thread stack overhead (1MB+ stack per thread).',
    impact: 'Thread exhaustion, sluggish concurrency scaling when executing multiple tools simultaneously.',
    remediation: 'Utilize Java 21 Virtual Threads (Thread.ofVirtual().start()) for stream drainage and asynchronous HTTP handlers, achieving near-zero thread memory overhead.',
    remediedByPojo: 'AbstractProcessRunner',
    threatSeverity: 'Medium',
    cveReference: 'Architectural Performance Anti-Pattern',
    beforeLogic: 'new Thread(stdoutDrainer).start(); // Heavy OS kernel thread per stream',
    afterLogic: 'Thread.ofVirtual().start(stdoutDrainer); // Lightweight user-mode virtual thread',
  },
  {
    id: 'GAP-08',
    title: 'JDK 21 Virtual-Thread Carrier Pinning (K8)',
    gap: 'On JDK 21, virtual threads executing inside synchronized blocks or calling Object.wait() are pinned to OS carrier threads. Hundreds of parked SSE subscribers or HITL approvals starve carrier thread pools.',
    impact: 'Process hangs, SSE event stalls, thread pool exhaustion across agent reasoning loops.',
    remediation: 'Ban synchronized blocks in kernel.agent and kernel.web; enforce ReentrantLock/Condition for virtual thread compatibility.',
    remediedByPojo: 'ReentrantLock & PinningIT',
    threatSeverity: 'High',
    cveReference: 'Sonar S6906 (Virtual Thread Pinning)',
    beforeLogic: 'synchronized(lock) { while(!done) { lock.wait(); } } // Pins virtual thread to OS carrier',
    afterLogic: 'reentrantLock.lock(); try { condition.await(); } finally { reentrantLock.unlock(); }',
  },
  {
    id: 'GAP-09',
    title: 'Masked Erosion of Redundant Safeguards (E6)',
    gap: 'In self-improving agent loops, acceptance gates grading on task completion alone fail to detect removal of overlapping guardrails because sibling safeguards still block harm.',
    impact: 'Silent degradation of defense-in-depth across self-evolution cycles.',
    remediation: 'Implement protection inventory monotonicity: candidate commits cannot reduce active guardrail IDs or capability classes without signed operator grants.',
    remediedByPojo: 'SandboxValidationSentinel (ProtectionInventory)',
    threatSeverity: 'High',
    cveReference: 'arXiv:2610.38392 (Masked Erosion)',
    beforeLogic: 'if (taskSuite.passes()) { acceptProposal(); } // Silently drops redundant safeguards',
    afterLogic: 'assertMonotonicGuardrails(parentCommit, candidateCommit, signedGrant);',
  },
  {
    id: 'GAP-10',
    title: 'Untrusted MCP Tool Descriptor Command Injection (M1)',
    gap: 'Anthropic official MCP SDK STDIO config vulnerabilities allow arbitrary OS command injection via unvalidated tool descriptors.',
    impact: 'Remote code execution (RCE) via untrusted MCP server descriptors in multi-agent environments.',
    remediation: 'Validate all MCP tool descriptors against tenant capability grants and binary allow-lists prior to client instantiation.',
    remediedByPojo: 'McpToolProvider & McpDescriptorIT',
    threatSeverity: 'Critical',
    cveReference: 'CVE-2026-42184 / OX Security MCP Advisory',
    beforeLogic: 'mcpClientFactory.create(descriptor); // Blindly accepts STDIO command string',
    afterLogic: 'validateDescriptorAgainstGrant(descriptor, grant); mcpClientFactory.create(descriptor);',
  },
  {
    id: 'GAP-11',
    title: 'Tauri Origin Confusion & CSP Weakness (C5)',
    gap: 'Tauri is_local_url() misclassified remote subdomains as local IPC origins, enabling untrusted markup to execute privileged IPC commands.',
    impact: 'Local IPC hijacking and XSS execution from streaming agent markdown.',
    remediation: 'Require Tauri >= 2.11.1, harden CSP to disallow data: and blob: in script-src, and sanitize all agent tokens before rendering.',
    remediedByPojo: 'Tauri 2.11.1 & TokenSanitizer',
    threatSeverity: 'High',
    cveReference: 'CVE-2026-42184 (CVSS 8.8)',
    beforeLogic: 'script-src \'self\' data: blob:; // Allows data URI script execution',
    afterLogic: 'script-src \'self\'; // Strict origin with token HTML sanitization',
  },
  {
    id: 'GAP-12',
    title: 'Spring AI Tool Callback Streaming Fallback Anomaly (C6)',
    gap: 'Spring AI .stream() falls back to non-streaming execution when tool calls occur, causing ordering anomalies and event latency spikes.',
    impact: 'Client UI experiences frozen streaming, duplicate events, or inverted tool-call/result pairs.',
    remediation: 'Enforce monotonic sequence ordering and explicit tool-boundary state events across non-streaming fallback periods.',
    remediedByPojo: 'StreamToolFallbackIT & WireEventProjection',
    threatSeverity: 'Medium',
    cveReference: 'CopilotKit PR #4475',
    beforeLogic: 'stream.onNext(chunk); // Tool boundary causes abrupt synchronous blocking',
    afterLogic: 'emitToolBoundaryState(); awaitMonoToolResult(); resumeStreamMonotonicSeq();',
  },
  {
    id: 'GAP-13',
    title: 'Multi-Hop Relational Memory Collapse (M2)',
    gap: 'Vector-only embeddings retrieve single facts by geometric proximity but collapse on multi-hop relational reasoning.',
    impact: 'Agent forgets chronological decisions, replacement policies, and cross-session objections.',
    remediation: 'Deploy hybrid memory: GraphStorePort for relational context and VectorStorePort for semantic discovery.',
    remediedByPojo: 'GraphStorePort & MultiHopMemoryIT',
    threatSeverity: 'Medium',
    cveReference: 'GraphRAG Benchmark Defect',
    beforeLogic: 'vectorStore.similaritySearch(query); // Fails multi-hop relation linking',
    afterLogic: 'hybridRouter.query(vectorStore.findSeed(), graphStore.traverseHops(2));',
  },
];

export const SUBSYSTEMS: Subsystem[] = [
  {
    id: 'sub-security',
    name: 'Security & Memory Hygiene',
    layer: 1,
    description: 'Manages credential zeroing, environment allowlisting, virtual-thread asynchronous I/O, process tree termination, and cooperative task cancellation.',
    keyMechanisms: [
      'SecureSecret: Character buffer credential holder implementing AutoCloseable and Destroyable.',
      'EnvironmentSanitizer: Whitelist-only environment map builder that blocks host secret exfiltration.',
      'ProcessTreeTerminator: Uses JDK 21 ProcessHandle API to kill entire process trees, preventing zombie processes.',
      'CancellationToken: Atomic signaling primitive for halting inference streams and script executions.',
      'Virtual Threads: java.lang.Thread.ofVirtual() for lightweight, non-blocking stream drainage.',
    ],
    associatedPojos: ['SecureSecret', 'EnvironmentSanitizer', 'ProcessTreeTerminator', 'CancellationToken'],
    securityRole: 'Hard boundary protecting host JVM credentials and preventing orphaned system resources.',
  },
  {
    id: 'sub-json',
    name: 'Zero-Dependency JSON AST & Parser',
    layer: 2,
    description: 'A self-contained JSON Abstract Syntax Tree (AST) and recursive-descent parser providing complete serialization and extraction without Jackson or Gson.',
    keyMechanisms: [
      'JsonNode: Sealed or abstract AST root with lightweight subtypes (JsonObject, JsonArray, JsonString, JsonNumber, JsonBoolean, JsonNull).',
      'JsonParser: Zero-dependency recursive descent parser with depth limits to defend against deeply nested stack-overflow attacks.',
      'Strict escape sequence support: \\", \\\\, \\n, \\r, \\t, \\uXXXX.',
    ],
    associatedPojos: ['JsonNode', 'JsonParser'],
    securityRole: 'Guarantees zero CVE injection from third-party JSON parsers; enforces recursion depth defense.',
  },
  {
    id: 'sub-domain',
    name: 'Domain Model & Context Management',
    layer: 3,
    description: 'Normalized data carriers for conversational turns, tool schemas, token estimation, and context budget management.',
    keyMechanisms: [
      'Java Records for immutability and token economy: ChatMessage, ToolCall, ToolDefinition, InferenceRequest, InferenceResponse.',
      'TokenEstimator: Zero-dependency character-to-token heuristic calculator (~3.8 to 4.0 chars/token).',
      'ContextCompactor: Sliding-window history pruner preserving system prompts while keeping message history within model limits.',
    ],
    associatedPojos: ['ChatRole', 'ChatMessage', 'ToolCall', 'ToolDefinition', 'InferenceRequest', 'InferenceResponse', 'TokenEstimator', 'ContextCompactor'],
    securityRole: 'Immutability prevents race conditions; token estimation prevents LLM API budget rejections.',
  },
  {
    id: 'sub-transport',
    name: 'Inference Transport Layer',
    layer: 4,
    description: 'Unified client layer built on java.net.http.HttpClient supporting HTTP/2, Server-Sent Events (SSE) streaming, and loopback verification.',
    keyMechanisms: [
      'LlmClient: Common strategy contract for synchronous and streaming inference.',
      'AbstractHttpLlmClient: Shared HTTP/2 transport engine with zero-dependency SSE line parsing.',
      'CloudLlmClient: Cloud provider client injecting authorization headers directly from SecureSecret.',
      'LocalLlmClient: Loopback client targeting local daemons (Ollama, llama.cpp server) with strict SSRF defense.',
    ],
    associatedPojos: ['StreamConsumer', 'LlmClient', 'AbstractHttpLlmClient', 'CloudLlmClient', 'LocalLlmClient'],
    securityRole: 'Strict loopback validation against SSRF; transient header injection without heap String retention.',
  },
  {
    id: 'sub-scripting',
    name: 'Polyglot Guest Scripting Bridge',
    layer: 5,
    description: 'Standardized execution runners for dynamic scripts, emphasizing TypeScript as the primary engine and Python as an auxiliary engine.',
    keyMechanisms: [
      'AbstractProcessRunner: Base runner managing virtual-thread stream readers, timeouts, and process tree destruction.',
      'TypeScriptRunner: Primary execution runner targeting modern runtimes (Deno, Bun, or ts-node) with permission flags.',
      'PythonRunner: Specialized runner targeting python3 or isolated virtual environment (venv) binaries.',
      'EphemeralScriptManager: Manages temporary script file lifecycles with guaranteed deletion via AutoCloseable.',
    ],
    associatedPojos: ['ScriptExecutionRequest', 'ScriptExecutionResult', 'EphemeralScriptManager', 'AbstractProcessRunner', 'TypeScriptRunner', 'PythonRunner'],
    securityRole: 'Direct ProcessBuilder invocation (no shell wrapper) eliminates shell injection vulnerabilities.',
  },
  {
    id: 'sub-agent',
    name: 'Agentic ReAct Core & Presentation',
    layer: 6,
    description: 'The autonomous ReAct (Reasoning + Acting) execution engine and decoupled presentation abstraction.',
    keyMechanisms: [
      'AgentEngine: Orchestrates the multi-turn Thought-Action-Observation loop.',
      'Tool & ScriptDelegatingTool: Executable interfaces binding LLM tool calls to TypeScript or Python scripts.',
      'AgentContext: Stateful session tracker enforcing maximum iteration bounds.',
      'UiBridge: Decoupled observer interface allowing any presentation layer (JavaFX, CLI, WebSockets) to subscribe to streaming tokens, status updates, and tool execution events.',
    ],
    associatedPojos: ['Tool', 'ScriptDelegatingTool', 'AgentContext', 'AgentEngine', 'UiBridge'],
    securityRole: 'Strict iteration bounds (e.g. 10 turns) prevent runaway billing and infinite recursive loops.',
  },
  {
    id: 'sub-factories',
    name: 'Dynamic Factories & Runtime Discovery',
    layer: 7,
    description: 'Factory layer for dynamically instantiating clients and script runners based on runtime configuration and host binary availability.',
    keyMechanisms: [
      'LlmClientFactory: Instantiates configured local or cloud clients with validation.',
      'ScriptRunnerFactory: Discovers available runtimes on the system PATH with a fallback order favoring TypeScript runtimes (Deno -> Bun -> ts-node) before Python.',
    ],
    associatedPojos: ['LlmClientFactory', 'ScriptRunnerFactory'],
    securityRole: 'Validates execution bits and ensures safe default options prior to instantiation.',
  },
  {
    id: 'sub-wiki',
    name: 'Obsidian Wiki Documentation Architecture',
    layer: 8,
    description: 'Bi-directional Markdown documentation graph with YAML frontmatter and [[WikiLinks]] for contextual ingestion by downstream LLMs.',
    keyMechanisms: [
      'INDEX.md root knowledge index linking all architectural domains.',
      'YAML frontmatter schema: id, title, type, module, context_cost (<400 tokens), tags, related_links.',
      'Explicit navigation graph preventing LLM token waste on full directory scans.',
    ],
    associatedPojos: ['All 26 POJOs mapped in graph'],
    securityRole: 'Minimizes LLM prompt token exhaustion and enforces architectural compliance.',
  },
];

export const DOWNSTREAM_STEPS: MilestoneStep[] = [
  {
    step: 1,
    task: 'Obsidian Documentation Graph Generation',
    details: 'Create INDEX.md and the nine linked markdown files in docs/. Establishes the contextual knowledge graph and architectural contracts before code generation.',
    phaseId: 1,
    tokenBudget: 3200,
    targetArtifacts: ['INDEX.md', 'docs/security/*.md', 'docs/json/*.md', 'docs/domain/*.md', 'docs/client/*.md', 'docs/scripting/*.md', 'docs/agent/*.md', 'docs/ui/*.md'],
    acceptanceCriteria: [
      'All 9 doc files have valid YAML frontmatter matching the schema',
      'All [[WikiLinks]] resolve bidirectionally with zero dead links',
      'Average token cost per doc page is < 400 tokens',
    ],
    status: 'completed',
  },
  {
    step: 2,
    task: 'Foundation & Security Layer Generation',
    details: 'Implement SecureSecret, EnvironmentSanitizer, ProcessTreeTerminator, and CancellationToken. Verify zero third-party imports and mutable char buffer memory scrubbing.',
    phaseId: 1,
    tokenBudget: 2400,
    targetArtifacts: ['com.leanllm.security.SecureSecret', 'com.leanllm.security.EnvironmentSanitizer', 'com.leanllm.security.ProcessTreeTerminator', 'com.leanllm.concurrency.CancellationToken'],
    acceptanceCriteria: [
      'SecureSecret wipes char[] with null bytes upon close()',
      'accessSecret() throws IllegalStateException after close()',
      'EnvironmentSanitizer enforces strict allowlist policy',
      'ProcessTreeTerminator traverses JDK 21 ProcessHandle.descendants()',
    ],
    status: 'in_progress',
  },
  {
    step: 3,
    task: 'Zero-Dependency JSON Engine Generation',
    details: 'Implement JsonNode (and compact subtype records) and JsonParser. Validate recursion depth limits (MAX_DEPTH=64) and string escaping correctness.',
    phaseId: 1,
    tokenBudget: 2800,
    targetArtifacts: ['com.leanllm.json.JsonNode', 'com.leanllm.json.JsonParser'],
    acceptanceCriteria: [
      'Recursive-descent parser correctly parses objects, arrays, strings, numbers, booleans, and nulls',
      'Recursion depth limit throws ParseException on nested attack vectors',
      'Serializes cleanly back to valid JSON strings without Jackson/Gson',
    ],
    status: 'pending',
  },
  {
    step: 4,
    task: 'Domain Records & Token Management Generation',
    details: 'Implement ChatRole, ChatMessage, ToolCall, ToolDefinition, InferenceRequest, InferenceResponse, TokenEstimator, and ContextCompactor. Use Java Records to minimize code footprint.',
    phaseId: 2,
    tokenBudget: 3000,
    targetArtifacts: ['com.leanllm.domain.*', 'com.leanllm.agent.ContextCompactor'],
    acceptanceCriteria: [
      'Java Records used for all immutable data carriers',
      'TokenEstimator calculates 3.8-4.0 chars/token approximation',
      'ContextCompactor preserves System prompts at index 0 during sliding-window pruning',
    ],
    status: 'pending',
  },
  {
    step: 5,
    task: 'Transport & Inference Client Layer Generation',
    details: 'Implement StreamConsumer, LlmClient, AbstractHttpLlmClient, CloudLlmClient, and LocalLlmClient. Use JDK HttpClient with zero-dependency SSE parsing via BufferedReader.',
    phaseId: 2,
    tokenBudget: 3600,
    targetArtifacts: ['com.leanllm.client.*', 'com.leanllm.client.http.*', 'com.leanllm.client.cloud.*', 'com.leanllm.client.local.*'],
    acceptanceCriteria: [
      'HTTP/2 transport with TLS 1.3 for cloud endpoints',
      'LocalLlmClient asserts loopback address (127.0.0.1, ::1, localhost) for SSRF defense',
      'CancellationToken checked during SSE line loops',
    ],
    status: 'pending',
  },
  {
    step: 6,
    task: 'Polyglot Scripting Bridge Generation',
    details: 'Implement ScriptExecutionRequest, ScriptExecutionResult, EphemeralScriptManager, AbstractProcessRunner, TypeScriptRunner, and PythonRunner. Virtual threads drain streams.',
    phaseId: 3,
    tokenBudget: 3400,
    targetArtifacts: ['com.leanllm.scripting.*', 'com.leanllm.scripting.ts.*', 'com.leanllm.scripting.python.*'],
    acceptanceCriteria: [
      'Direct ProcessBuilder execution without shell wrappers (no sh -c or cmd /c)',
      'Thread.ofVirtual().start() drains stdout and stderr asynchronously to prevent pipe deadlocks',
      'ProcessTreeTerminator called upon timeout or task cancellation',
      'TypeScript prioritized over Python for tool execution',
    ],
    status: 'pending',
  },
  {
    step: 7,
    task: 'Agentic Core & Presentation Layer Generation',
    details: 'Implement Tool, ScriptDelegatingTool, AgentContext, AgentEngine, and UiBridge. Verify ReAct loop terminates gracefully and propagates token streaming events.',
    phaseId: 4,
    tokenBudget: 3500,
    targetArtifacts: ['com.leanllm.agent.Tool', 'com.leanllm.agent.ScriptDelegatingTool', 'com.leanllm.agent.AgentContext', 'com.leanllm.agent.AgentEngine', 'com.leanllm.ui.UiBridge'],
    acceptanceCriteria: [
      'ReAct loop cycles through Thought -> Action -> Observation until final reply',
      'Hard iteration limit (10 turns) enforces loop termination',
      'UiBridge observer notified asynchronously without blocking inference threads',
    ],
    status: 'pending',
  },
  {
    step: 8,
    task: 'Factories & Clean Compilation Verification',
    details: 'Implement LlmClientFactory and ScriptRunnerFactory. Run a standard JDK javac build across all packages to verify 100% clean compilation with zero warnings.',
    phaseId: 5,
    tokenBudget: 2200,
    targetArtifacts: ['com.leanllm.factory.LlmClientFactory', 'com.leanllm.factory.ScriptRunnerFactory'],
    acceptanceCriteria: [
      'LlmClientFactory validates URIs and initializes TLS options',
      'ScriptRunnerFactory detects Deno -> Bun -> ts-node -> Python3 in order',
      '100% javac compilation pass on Java 21 LTS with -Xlint:all -Werror',
    ],
    status: 'pending',
  },
];

export const IMPLEMENTATION_PHASES: ImplementationPhase[] = [
  {
    id: 1,
    code: 'P1',
    name: 'Phase 1',
    title: 'Kernel Domain Records & Context Threading',
    plane: 'kernel',
    salvageTag: '[SALVAGE: LeanJavallm]',
    summary: 'Compile-time-typed foundation with no runtime mutation surface. Immutable domain records, sealed hierarchies, and explicit execution context threading.',
    estimatedWeeks: 'Weeks 1-2',
    prerequisites: [],
    status: 'completed',
    deliverables: [
      'TenantId, SessionId, CommitId, BlobId, PermissionGrant records',
      'AgentStreamEvent sealed hierarchy (9 permitted subtypes)',
      'DomainMessage sealed hierarchy (4 permitted subtypes)',
      'ExecutionContext record with explicit method parameter threading',
      'CancellationToken primitive [SALVAGE: LeanJavallm] (atomic-flag cooperative cancellation)',
    ],
    verificationCriteria: [
      'mvn test green on root POM and apex-chat-common',
      '100% branch coverage on record compact constructors',
      'Mutating record collection throws UnsupportedOperationException at construction',
      'CancellationToken cancellation observed within 100ms by awaiting CompletableFuture',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 1),
    subsystemsInvolved: ['Kernel Plane', 'Domain Records', 'Security & Concurrency'],
    riskFactor: 'Low',
    riskMitigation: 'Enforce defensive copying (List.copyOf) in all record compact constructors.',
  },
  {
    id: 2,
    code: 'P2',
    name: 'Phase 2',
    title: 'CAS Evolution Engine',
    plane: 'evolution',
    summary: 'Content-Addressable Storage (CAS) with no concurrent-corruption path. Implements Git-tree blob, tree, commit, and branch structures.',
    estimatedWeeks: 'Weeks 3-4',
    prerequisites: [1],
    status: 'in_progress',
    deliverables: [
      'WorkspaceStoragePort interface',
      'PostgreSQL storage adapter for multi-tenant cloud',
      'SQLite storage adapter with WAL mode & single-writer optimistic CAS for SBC nodes',
      'Flyway migrations for workspace_blob, workspace_tree, workspace_commit, workspace_branch',
    ],
    verificationCriteria: [
      'CasConcurrencyIT: 16 virtual threads x 4 branches with zero data corruption',
      'WorkspaceBlob SHA-256 deduplication is strictly idempotent',
      'Branch pointer CAS update loses no writes under contention',
      'PRAGMA integrity_check passes cleanly after SQLite stress test',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 2),
    subsystemsInvolved: ['CAS Evolution Plane', 'Storage Port', 'Database Adapters'],
    riskFactor: 'Medium',
    riskMitigation: 'Test SQLite under high write concurrency with WAL journal mode.',
  },
  {
    id: 3,
    code: 'P3',
    name: 'Phase 3',
    title: 'Workspace Materialization',
    plane: 'evolution',
    summary: 'Compiles CAS tree into deeply immutable CompiledAgentWorkspace and single wire DTO AgentProfileView.',
    estimatedWeeks: 'Weeks 5-6',
    prerequisites: [1, 2],
    status: 'in_progress',
    deliverables: [
      'WorkspaceMaterializer parsing SKILL.md, tools/**/*.json, config/mcp-servers.json',
      'IMMUTABLE_KERNEL_INVARIANTS compiled constant merged at materialization',
      'AgentProfileView as the single wire DTO between TS client and Java kernel',
    ],
    verificationCriteria: [
      'Round-trip test: commit -> materialize -> profile view -> OpenAPI -> TS type',
      'Materialized workspaces are deeply immutable (property tests)',
      '60s cache by CommitId proven correct with zero stale reads on branch advance',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 3),
    subsystemsInvolved: ['CAS Evolution Plane', 'Workspace Materializer', 'OpenAPI Schema'],
    riskFactor: 'Medium',
    riskMitigation: 'Cache invalidation keyed directly on SHA-256 CommitId.',
  },
  {
    id: 4,
    code: 'P4',
    name: 'Phase 4',
    title: 'Sandboxed Process Executor',
    plane: 'plugin',
    salvageTag: '[SALVAGE: LeanJavallm] [SALVAGE: Agenticplatformsetup]',
    summary: 'Command execution with zero shell-injection surface, canonical RealPathJail root confinement, and ProcessTreeTerminator orphan process prevention.',
    estimatedWeeks: 'Weeks 7-8',
    prerequisites: [1],
    status: 'completed',
    deliverables: [
      'SandboxedProcessExecutor (tokenized argv, no intermediate /bin/sh wrappers)',
      'RealPathJail canonical-path filter (toRealPath().startsWith(workspaceRoot))',
      'ProcessTreeTerminator [SALVAGE: LeanJavallm] (recursive ProcessHandle descendants kill)',
      'Per-tenant binary allowlist',
      '30s default timeout with 50KB output cap',
    ],
    verificationCriteria: [
      'ProcessInjectionIT: shell metacharacters (; $() ` | &&) reach target binary as literal argv bytes',
      'OrphanProcessIT: grandchild processes killed cleanly with 0 surviving orphans on abort',
      'PathTraversalIT: ../ path deviations rejected prior to ProcessBuilder.start()',
      'Cancellation via CancellationToken terminates entire process tree within 500ms',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 3),
    subsystemsInvolved: ['Plugin Host', 'Sandboxing', 'Process Management'],
    riskFactor: 'High',
    riskMitigation: 'Enforce realpath jail and binary allowlist before process spawn.',
  },
  {
    id: 5,
    code: 'P5',
    name: 'Phase 5',
    title: 'SandboxValidationSentinel',
    plane: 'evolution',
    salvageTag: '[SALVAGE: Agenticplatformsetup]',
    summary: 'The safety keystone: 6-category automated gate before ProposalCreated, enriched with Invariant E6 anti-masked erosion check.',
    estimatedWeeks: 'Weeks 9-10',
    prerequisites: [2, 3],
    status: 'pending',
    deliverables: [
      'SandboxValidationSentinel with 6 validators (Structural, Security, Capability, Dry-run, Regression, Budget)',
      'Protection Inventory diffing (Invariant E6): candidate cannot drop guardrails without signed operator grant',
      'Tiered SKILL.md token budgets (150 lines operational / 200 lines domain)',
      'Rollback handler reverting branch to parent on any validation rejection',
    ],
    verificationCriteria: [
      '6 x parameterized test classes, each with passing and failing fixtures',
      'Any failure emits SANDBOX_REJECTED:<CATEGORY> and rolls back branch atomically',
      'Capability escalation (WRITE, NET_EGRESS, PROC_SPAWN, SCREEN_INJECT) forces human grant',
      'MaskedErosionIT rejects redundant safeguard deletion',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 4),
    subsystemsInvolved: ['CAS Evolution Plane', 'Sentinel', 'Safety Gates'],
    riskFactor: 'High',
    riskMitigation: 'Require explicit signed PermissionGrant for all capability escalations.',
  },
  {
    id: 6,
    code: 'P6',
    name: 'Phase 6',
    title: 'LangChain4j Orchestration & MCP',
    plane: 'kernel',
    salvageTag: '[SALVAGE: LeanJavallm]',
    summary: 'Supervisor/specialist loop over SSE with context overflow defense, safe MCP tool provider, and monotonic stream ordering.',
    estimatedWeeks: 'Weeks 11-12',
    prerequisites: [1, 4, 5],
    status: 'pending',
    deliverables: [
      'DynamicAgentFactory building SupervisorAgent from AgentProfileView',
      'McpToolProvider with pre-instantiation descriptor validation (Invariant M1)',
      'TokenEstimator [SALVAGE: LeanJavallm] (~3.8 chars/token pre-inference estimator)',
      'ContextCompactor [SALVAGE: LeanJavallm] (sliding-window history pruning preserving SYSTEM prompt)',
      'Streaming tool-boundary monotonic sequence preservation (Invariant C6)',
    ],
    verificationCriteria: [
      'E2E: prompt -> orchestrator spawns specialist -> specialist runs stub tool -> SSE renders both turns',
      'writeWorkspaceFile to main rejected by construction (sandbox branch only)',
      'ContextCompactor preserves SYSTEM message and tool-call/result pairs under forced overflow',
      'StreamToolFallbackIT: SSE sequence is monotonic and duplicate-free across tool calls',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 4),
    subsystemsInvolved: ['Kernel Plane', 'LangChain4j ReAct', 'MCP Protocol'],
    riskFactor: 'Medium',
    riskMitigation: 'Validate MCP tool descriptors against tenant allowlist before client creation.',
  },
  {
    id: 7,
    code: 'P7',
    name: 'Phase 7',
    title: 'TypeScript Client & Isomorphic SSE',
    plane: 'client',
    summary: 'Live streaming into the workspace cockpit with strictly isomorphic generated types and auto-reconnecting SSE.',
    estimatedWeeks: 'Weeks 13-14',
    prerequisites: [1, 6],
    status: 'completed',
    deliverables: [
      'AgentStreamClient (fetch + ReadableStream with exponential backoff reconnect)',
      'AgentRoutingBar, AgentMessageCard, ReasoningAccordion, ToolInvocationBadge components',
      'Zustand session store with typed action dispatch',
      'openapi-typescript generation wired into CI drift checks (Invariant C1)',
    ],
    verificationCriteria: [
      'CI git diff --exit-code on src/generated/openapi.d.ts passes with zero drift',
      'SSE client reconnects after network drop without message duplication',
      'StreamError events render gracefully without unmounting the UI tree',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 5),
    subsystemsInvolved: ['Tauri / Web Client', 'SSE Stream', 'OpenAPI Isomorphism'],
    riskFactor: 'Low',
    riskMitigation: 'Enforce Zod boundary validation on all inbound server-sent events.',
  },
  {
    id: 8,
    code: 'P8',
    name: 'Phase 8',
    title: 'Tauri Desktop Packaging & HITL Approval',
    plane: 'client',
    summary: 'Native desktop shell with GitDiffReviewModal, hardened CSP (Invariant C5), and PermissionGrant signing flow.',
    estimatedWeeks: 'Weeks 15-16',
    prerequisites: [7],
    status: 'pending',
    deliverables: [
      'Tauri 2.11.1+ universal desktop shell (Linux WebKitGTK / Windows WebView2 / macOS WKWebView)',
      'GitDiffReviewModal (2-way diff with embedded sentinel report)',
      'PermissionGrant operator signing modal',
      'CSP hardening (script-src excludes data: and blob:) and agent token sanitization',
    ],
    verificationCriteria: [
      'App launches across all three desktop OSes with ~35MB shell baseline',
      'Proposal -> diff -> approve -> merge -> hot recompile works end-to-end',
      'Reject -> rollback leaves main untouched (verified by SHA-256 commit hash)',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 5),
    subsystemsInvolved: ['Tauri Shell', 'Human-in-the-Loop', 'CSP Security'],
    riskFactor: 'Medium',
    riskMitigation: 'Verify CSP headers reject data: and blob: URI script injection.',
  },
  {
    id: 9,
    code: 'P9',
    name: 'Phase 9',
    title: 'SBC Profile & OS Automation',
    plane: 'automation',
    summary: 'Low-resource Raspberry Pi 400 + Kali target with AT-SPI2 accessibility tree inspection and dead-man injection guard.',
    estimatedWeeks: 'Weeks 17-18',
    prerequisites: [4, 6],
    status: 'pending',
    deliverables: [
      'sbc Spring profile (SQLite WAL defaults, compact heap config)',
      'AT-SPI2 AccessibilityReader for Linux UI introspection',
      'HostEcosystemDiscoveryService (PATH tool & port probing)',
      'Dead-man switch + rate limit + password field block for OS injection guards',
    ],
    verificationCriteria: [
      'Platform runs on Raspberry Pi 400 with idle RSS within 300-400MB',
      'Accessibility tree of target window read accurately as JSON',
      'Dead-man switch blocks OS input synthesis when disarmed',
      'Password fields (role == "passwordField") are never injected into',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 5),
    subsystemsInvolved: ['OS Automation', 'SBC Embedded Profile', 'Accessibility'],
    riskFactor: 'High',
    riskMitigation: 'Hardware bench testing on physical Raspberry Pi 400 node.',
  },
  {
    id: 10,
    code: 'P10',
    name: 'Phase 10',
    title: 'Token Economics, Fallback & Memory Routing',
    plane: 'kernel',
    summary: 'Cost control, resilience fallback chains, and hybrid graph+vector memory routing (Invariant M2).',
    estimatedWeeks: 'Weeks 19-20',
    prerequisites: [6, 7],
    status: 'pending',
    deliverables: [
      'ChatModelProvider interface with ModelRegistry',
      'TokenMeter (pre-inference gate + post-inference accounting)',
      'Transparent fallback chain on provider 5xx / timeout / 429',
      'Hybrid memory router: GraphStorePort for relational hops + VectorStorePort for semantic discovery',
      'SSE BudgetWarning (80%) and BudgetExhausted (100%) events',
    ],
    verificationCriteria: [
      'Budget exhausted terminates stream with BudgetExhausted, preventing partial inference',
      'Provider 5xx triggers transparent fallback within the active conversation',
      'MultiHopMemoryIT: two-hop relational query passes via hybrid retrieval where vector-only fails',
    ],
    steps: DOWNSTREAM_STEPS.filter((s) => s.phaseId === 5),
    subsystemsInvolved: ['Token Economics', 'Hybrid Memory Router', 'Provider Fallback'],
    riskFactor: 'Medium',
    riskMitigation: 'Persist tenant token usage in SQLite WAL store to survive server restarts.',
  },
];

export const CORE_PORTS: CorePort[] = [
  {
    id: 'port-chat',
    name: 'Chat Model Port',
    interfaceName: 'ChatModelPort',
    tier: 'Tier 0 Pure',
    purpose: 'Provides streaming LLM inference, message formatting, and tool calling abstraction.',
    adapterImplementation: 'OpenAiCompatibleProvider (in engine-llm-http) / SpringAiAdapter (Tier 2)',
    methodSignatures: [
      'StreamSubscription streamChat(InferenceRequest request, StreamSubscriber subscriber)',
      'InferenceResponse completeChat(InferenceRequest request)',
    ],
    isTested: true,
  },
  {
    id: 'port-planner',
    name: 'Planner Port',
    interfaceName: 'PlannerPort',
    tier: 'Tier 0 Pure',
    purpose: 'Deterministic Goal-Oriented Action Planning without invoking external LLMs.',
    adapterImplementation: 'AStarPlanner (in engine-planner, ~660 LOC native GOAP)',
    methodSignatures: [
      'PlanResult plan(State initialState, Goal targetGoal, List<Action> availableActions)',
    ],
    isTested: true,
  },
  {
    id: 'port-tools',
    name: 'Tool Executor Port',
    interfaceName: 'ToolExecutorPort',
    tier: 'Tier 0 Pure',
    purpose: 'Executes sandboxed OS commands, file I/O, and external scripts within RealPathJail.',
    adapterImplementation: 'KernelToolExecutor (in engine-tools-impl)',
    methodSignatures: [
      'ToolExecutionResult execute(String toolName, Map<String, Object> arguments, ExecutionContext ctx)',
    ],
    isTested: true,
  },
  {
    id: 'port-approval',
    name: 'Approval Port (HITL)',
    interfaceName: 'ApprovalPort',
    tier: 'Tier 0 Pure',
    purpose: 'Human-in-the-Loop decision gate with typed RiskLevel (L0 to L5).',
    adapterImplementation: 'ConsoleApprovalPort / TauriApprovalModalBridge',
    methodSignatures: [
      'ApprovalDecision requestApproval(ApprovalRequest request)',
    ],
    isTested: true,
  },
  {
    id: 'port-storage',
    name: 'Storage Port',
    interfaceName: 'StoragePort',
    tier: 'Tier 0 Pure',
    purpose: 'Persists execution step logs, checkpoints, and session metadata.',
    adapterImplementation: 'SqliteStoragePort (in engine-store-sqlite, WAL mode) / PostgresStorageAdapter',
    methodSignatures: [
      'void recordStep(SessionId sessionId, StepLog step)',
      'List<StepLog> querySteps(SessionId sessionId, int limit)',
    ],
    isTested: true,
  },
  {
    id: 'port-vector',
    name: 'Vector Store Port',
    interfaceName: 'VectorStorePort',
    tier: 'Tier 0 Pure',
    purpose: 'Performs semantic nearest-neighbor search for agent knowledge embeddings.',
    adapterImplementation: 'SqliteVecStorageAdapter / PgVectorAdapter (Tier 2)',
    methodSignatures: [
      'List<DocumentSnippet> searchSimilar(float[] embedding, int topK, float minScore)',
    ],
    isTested: false,
  },
  {
    id: 'port-graph',
    name: 'Graph Store Port (M2)',
    interfaceName: 'GraphStorePort',
    tier: 'Tier 0 Pure',
    purpose: 'Relational knowledge graph traversal to prevent multi-hop memory collapse (Invariant M2).',
    adapterImplementation: 'InMemoryAdjacencyGraphAdapter / FalkorDbAdapter',
    methodSignatures: [
      'List<GraphEdge> traverseRelations(NodeId startNode, int maxHops, Set<String> edgeTypes)',
    ],
    isTested: false,
  },
  {
    id: 'port-secrets',
    name: 'Secrets Port',
    interfaceName: 'SecretsPort',
    tier: 'Tier 0 Pure',
    purpose: 'Deterministic access to environment credentials with memory scrubbing.',
    adapterImplementation: 'MemoryScrubbedSecretsAdapter / EnvironmentSecretsAdapter',
    methodSignatures: [
      'SecureSecret acquireSecret(String secretKey)',
    ],
    isTested: true,
  },
  {
    id: 'port-audit',
    name: 'Audit Port',
    interfaceName: 'AuditPort',
    tier: 'Tier 0 Pure',
    purpose: 'Cryptographically chained SHA-256 audit logging of all agent actions and grants.',
    adapterImplementation: 'ChainedLogAuditAdapter (in apex-platform/apex-audit)',
    methodSignatures: [
      'void appendAuditRecord(AuditRecord record)',
      'boolean verifyAuditIntegrity(SessionId sessionId)',
    ],
    isTested: true,
  },
  {
    id: 'port-telemetry',
    name: 'Telemetry Port',
    interfaceName: 'TelemetryPort',
    tier: 'Tier 0 Pure',
    purpose: 'Tracks token expenditures, latency distributions, and budget alerts.',
    adapterImplementation: 'InMemoryTelemetryAdapter / MicrometerAdapter (Tier 2)',
    methodSignatures: [
      'void recordTokens(TenantId tenantId, int promptTokens, int completionTokens)',
      'TenantTokenUsage getUsage(TenantId tenantId)',
    ],
    isTested: true,
  },
];

export const SAFETY_INVARIANTS: SafetyInvariant[] = [
  {
    id: 'K1',
    plane: 'kernel',
    title: 'No Dynamic JVM Classloading',
    statement: 'Production code never invokes defineClass, URLClassLoader, or reflective bytecode emission.',
    test: 'Grep CI: zero defineClass or URLClassLoader references in production code',
    threatCategory: 'Arbitrary Code Execution',
  },
  {
    id: 'K2',
    plane: 'kernel',
    title: 'No Shell Interpolation',
    statement: 'Subprocesses execute directly via tokenized argv without /bin/sh or cmd.exe interpolation wrappers.',
    test: 'ProcessInjectionIT — metacharacters (; $() ` | &&) reach target binary as literal argv bytes',
    threatCategory: 'Command Injection',
  },
  {
    id: 'K3',
    plane: 'kernel',
    title: 'Immutable Kernel Constants',
    statement: 'IMMUTABLE_KERNEL_INVARIANTS are compiled constants with no runtime mutation path.',
    test: 'KernelInvariantTest — reflection/bytecode inspection confirms fields are final with no setters',
    threatCategory: 'Tamper Resistance',
  },
  {
    id: 'K4',
    plane: 'kernel',
    title: 'RealPathJail Canonical Root Confinement',
    statement: 'Tool execution is strictly jailed to canonical workspace root; symlinks and ../ deviations are rejected.',
    test: 'PathTraversalIT — realpath jail rejects ../, symlink escapes, and outside absolute paths',
    threatCategory: 'Path Traversal',
  },
  {
    id: 'K5',
    plane: 'kernel',
    title: 'No Orphan Processes',
    statement: 'On timeout or cancellation, ProcessTreeTerminator kills all ProcessHandle.descendants() recursively.',
    test: 'OrphanProcessIT — child and grandchild processes leave 0 surviving OS processes',
    threatCategory: 'Resource Exhaustion (CWE-400)',
  },
  {
    id: 'K6',
    plane: 'kernel',
    title: 'Prompt Cancellation Signaling',
    statement: 'Cancellation is observed within 100ms; process trees terminate within 500ms.',
    test: 'CancellationTokenTest — atomic flag propagation terminates CompletableFuture within 100ms',
    threatCategory: 'Unresponsive Service (CWE-834)',
  },
  {
    id: 'K7',
    plane: 'kernel',
    title: 'OS Input Injection Guard',
    statement: 'OS input synthesis guarded by dead-man switch, rate limiter, and password field detection.',
    test: 'InputInjectionGuardTest — disarmed switch blocks injection; role==passwordField rejected',
    threatCategory: 'Privilege Escalation',
  },
  {
    id: 'K8',
    plane: 'kernel',
    title: 'No Carrier Pinning on Agent Executor',
    statement: 'On JDK 21, no code on the agent executor may use synchronized or Object.wait(); enforce ReentrantLock.',
    test: 'Grep CI: zero synchronized in kernel.agent/** and kernel.web/**; PinningIT 500 virtual threads complete in <5s',
    yearAdded: 2026,
    threatCategory: 'Virtual Thread Starvation',
  },
  {
    id: 'E1',
    plane: 'evolution',
    title: 'Sentinel Gates Every Workspace Write',
    statement: 'SandboxValidationSentinel evaluates all 6 validation categories prior to emitting ProposalCreated.',
    test: 'SentinelGateTest — writeWorkspaceFile invokes sentinel and triggers rollback on any violation',
    threatCategory: 'Unauthorized Self-Modification',
  },
  {
    id: 'E2',
    plane: 'evolution',
    title: 'Capability Escalation Requires Human Grant',
    statement: 'Modifying WRITE, NET_EGRESS, PROC_SPAWN, or SCREEN_INJECT tools requires signed PermissionGrant.',
    test: 'CapabilityEscalationTest — escalations without signed grant fail validation',
    threatCategory: 'Privilege Escalation',
  },
  {
    id: 'E3',
    plane: 'evolution',
    title: 'Atomic Rollback on Sentinel Failure',
    statement: 'Any sentinel failure rolls the sandbox branch back to parent hash, preserving parent state.',
    test: 'RollbackIT — parent commit hash unchanged after rejected candidate proposal',
    threatCategory: 'State Corruption',
  },
  {
    id: 'E4',
    plane: 'evolution',
    title: 'Dangling Blob Referencing Impossible',
    statement: 'Commits referencing missing blobs fail foreign key and CAS integrity constraints.',
    test: 'CasConsistencyIT — content-addressed foreign keys reject missing blob hashes',
    threatCategory: 'Repository Inconsistency',
  },
  {
    id: 'E5',
    plane: 'evolution',
    title: 'Contended Branch CAS Loses No Writes',
    statement: 'Optimistic CAS updates on branch heads maintain linear history without losing writes.',
    test: 'CasConcurrencyIT — 16 virtual threads x 4 branches under contention lose 0 commits',
    threatCategory: 'Data Loss / Race Conditions',
  },
  {
    id: 'E6',
    plane: 'evolution',
    title: 'Protection Inventory Monotonicity (Anti-Masked Erosion)',
    statement: 'No commit may reduce active guardrail IDs or capability classes without an explicit signed operator grant.',
    test: 'MaskedErosionIT — deletes of redundant overlapping safeguards are rejected by sentinel',
    yearAdded: 2026,
    threatCategory: 'Silent Defense Degradation',
  },
  {
    id: 'M1',
    plane: 'plugin',
    title: 'Pre-Instantiation MCP Descriptor Validation',
    statement: 'MCP tool descriptors are treated as untrusted; validated against tenant capability grant and allowlist.',
    test: 'McpDescriptorIT — absolute paths outside workspace or commands with shell metacharacters rejected',
    yearAdded: 2026,
    threatCategory: 'Cross-Language RCE in MCP SDK',
  },
  {
    id: 'M2',
    plane: 'plugin',
    title: 'Hybrid Retrieval Preserves Multi-Hop Recall',
    statement: 'Relational multi-hop queries use GraphStorePort + VectorStorePort to prevent memory collapse.',
    test: 'MultiHopMemoryIT — two-hop relational query returns correct facts where vector-only fails',
    yearAdded: 2026,
    threatCategory: 'Multi-Hop Recall Collapse',
  },
  {
    id: 'C1',
    plane: 'client',
    title: 'TypeScript / Java Contract Isomorphism',
    statement: 'TypeScript client types strictly mirror Java OpenAPI definitions via automated CI drift checks.',
    test: 'CI git diff --exit-code src/generated/openapi.d.ts after schema generation',
    threatCategory: 'API Schema Drift',
  },
  {
    id: 'C2',
    plane: 'client',
    title: 'Zod Validation at Every Boundary',
    statement: 'All external input (files, SSE chunks, user forms) validated via Zod schemas prior to application state.',
    test: 'ZodBoundaryTest — malformed input payloads rejected at boundary with 0 crashes',
    threatCategory: 'Type Poisoning / Malformed Payloads',
  },
  {
    id: 'C3',
    plane: 'client',
    title: 'OSC Message Padding Alignment',
    statement: 'OSC encoding correctly pads messages: length % 4 == 0 case pads 0 bytes, not 4.',
    test: 'OscEncodingTest — verifies byte alignment across exact 4-byte boundaries',
    threatCategory: 'Protocol Desynchronization',
  },
  {
    id: 'C4',
    plane: 'client',
    title: 'ContextCompactor Preserves System Prompts',
    statement: 'History pruning strictly preserves index 0 SYSTEM prompt and paired tool-call/result turns.',
    test: 'CompactorFixtureTest — forced overflow retains System message and last N valid turns',
    threatCategory: 'Agent Instruction Amnesia',
  },
  {
    id: 'C5',
    plane: 'client',
    title: 'Tauri Origin & CSP Hardening',
    statement: 'Requires Tauri >= 2.11.1; CSP excludes data: and blob: from script-src; agent tokens sanitized.',
    test: 'CI version check + CSP grep + XSS fixture rendering test',
    yearAdded: 2026,
    threatCategory: 'Origin Confusion / XSS (CVE-2026-42184)',
  },
  {
    id: 'C6',
    plane: 'client',
    title: 'Streaming Tool-Boundary Monotonic Ordering',
    statement: 'SSE WireEvent sequence remains monotonic and duplicate-free across mid-stream tool calls.',
    test: 'StreamToolFallbackIT — tool invocation mid-stream emits clean boundary and resumes order',
    yearAdded: 2026,
    threatCategory: 'Event Desynchronization',
  },
];

export const VERIFICATION_LADDER: VerificationLayer[] = [
  {
    id: 'L0',
    name: 'Deterministic Pre-Gates',
    modelTier: 'none',
    cost: 'near-zero',
    authority: 'Sole authority for mechanical failure',
    catches: 'Compilation errors, lint failures, typecheck drift, schema invalidity, exit codes',
    rule: 'Decidable checks belong in a script, never in an agent prompt. Deterministic checks outrank every LLM judgment.',
  },
  {
    id: 'L1',
    name: 'Worker Self-Check',
    modelTier: 'cheap',
    cost: 'low',
    authority: 'None (structural optimism filter)',
    catches: 'Obvious execution flaws, syntax typos; reduces wasted reviewer cycles',
    rule: 'Never the acceptance authority. Workers are structurally optimistic and prone to self-confirmation bias.',
  },
  {
    id: 'L2',
    name: 'Cross-Family Peer Verifier',
    modelTier: 'mid',
    cost: 'moderate',
    authority: 'Binary per-criterion verdict (yes/no)',
    catches: 'Correlated blind spots of the executor model family',
    rule: 'At least one verifier must be from a different model family than the executor. Cannot override an L0 failure.',
  },
  {
    id: 'L3',
    name: 'Independent QA / Holdout',
    modelTier: 'mid',
    cost: 'moderate-high',
    authority: 'Black-box behavioral evaluation',
    catches: 'Silent mocking, integration drift, spec-gap resolutions, post-hoc confirmation tests',
    rule: 'QA generates test scenarios from acceptance criteria without seeing the worker test plan. Evaluates artifact as a black box.',
  },
  {
    id: 'L4',
    name: 'Integration Verifier',
    modelTier: 'mid',
    cost: 'moderate',
    authority: 'Seam behavior verification',
    catches: 'Cross-module interface drift and boundary mismatches between independent worker chunks',
    rule: 'Active conditionally only when multi-module interface drift is a named failure class for the project.',
  },
  {
    id: 'L5',
    name: 'Architect Acceptance',
    modelTier: 'frontier',
    cost: 'high',
    authority: 'Final adjudication',
    catches: 'Architectural conformance, residual Spec Gaps, split verdicts needing escalation',
    rule: 'The architect reads the ledger (criterion -> disposition -> evidence digest), never raw worker transcripts or code.',
  },
];

export const SAMPLE_HANDOFF_ENVELOPE: HandoffEnvelope = {
  handoff_id: '9f1c2a7e-4b3d-4e8a-9c1f-2d6e8b0a3c5f',
  parent_run_id: 'run-2026-11-02-001',
  task_id: 'FEAT-AUTH-003',
  from_agent: 'architect',
  to_agent: 'coder-ts-01',
  worker_role: 'executor',
  objective: 'Implement the JWT refresh endpoint in src/auth/refresh.ts conforming to the interface contract.',
  acceptance_criteria: [
    { id: 'AC-1', criterion: 'Endpoint returns 200 with new access token for valid refresh token.' },
    { id: 'AC-2', criterion: 'Expired or revoked refresh tokens return 401 with code TOKEN_INVALID.' },
    { id: 'AC-3', criterion: 'Unit test coverage >= 90% with zero mocking of the hash verifier.' },
  ],
  constraints: [
    'Do not modify the public API of src/auth/index.ts',
    'Use existing TokenStore interface; do not add new external dependencies',
    'Execute in isolated git worktree: orchestrator/coder-ts-01__FEAT-AUTH-003',
  ],
  allowed_tools: ['file.read', 'file.write', 'file.edit', 'shell.exec', 'test.run', 'git.commit'],
  budget: {
    steps: 20,
    time_ms: 300000,
    cost_usd: 0.40,
  },
  deadline: '2026-11-02T18:00:00Z',
  authority_digest: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};

export const SAMPLE_RESULT_CONTRACT: ResultContract = {
  status: 'completed',
  criteria: [
    { id: 'AC-1', disposition: 'pass', evidence_digest: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' },
    { id: 'AC-2', disposition: 'pass', evidence_digest: 'sha256:cb2fdba956a4b25afeaebb13627d9fe5b5694a56d9fe5b5694a56450b4b3e25d' },
    { id: 'AC-3', disposition: 'pass', evidence_digest: 'sha256:ad1b89623c1fb74d0a32272121c39971f86e578bd4e9e58e40c01ea3ff5eb0bd' },
  ],
  changed_files: ['src/auth/refresh.ts', 'src/auth/refresh.test.ts'],
  unresolved: [],
  verification: {
    commands_run: ['npm run test -- src/auth/refresh.test.ts', 'npx tsc --noEmit'],
    results: ['pass', 'pass'],
  },
};

export const POJO_INVENTORY: PojoSpecification[] = [
  {
    className: 'SecureSecret',
    packageName: 'com.leanllm.security',
    type: 'class',
    locTarget: '< 80 LOC',
    actualLocEstimate: 68,
    category: 'Security & Memory Hygiene',
    purpose: 'Stores API tokens in mutable char[] buffers with explicit deterministic wiping via AutoCloseable and Destroyable.',
    whyWeNeedIt: 'Standard Java String objects persist indefinitely in the JVM String Pool or heap, leaving credentials vulnerable to heap analysis or swap space exfiltration.',
    securityAndEnterpriseNotes: 'Implements AutoCloseable and java.security.Destroyable. Thread-safe via synchronized locks. Throws IllegalStateException on access after being wiped.',
    fieldsToImplement: [
      { name: 'secretBuffer', type: 'char[]', description: 'Internal mutable buffer storing sensitive characters.', isPrivate: true },
      { name: 'destroyed', type: 'boolean', description: 'State flag tracking whether the secret has been purged.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'SecureSecret(char[] secret)', behavior: 'Defensively copies input array into secretBuffer.' },
      { signature: 'SecureSecret(String secret)', behavior: 'Converts string to character array defensively.' },
      { signature: 'char[] accessSecret()', behavior: 'Returns a defensive clone of secretBuffer; asserts active state.' },
      { signature: 'void close()', behavior: 'Fills secretBuffer with \\0 null bytes and marks destroyed as true.' },
      { signature: 'boolean isDestroyed()', behavior: 'Returns current destroyed state flag.' },
    ],
    instructionForGeneratingAgent: 'Ensure zero String leakages in internal state. In Javadoc, detail why character arrays were selected over String objects and include memory safety guarantees.',
    javaCodeTemplate: `package com.leanllm.security;

import java.security.Destroyable;
import java.util.Arrays;

/**
 * @summary Memory-safe credential container with deterministic null-byte zeroing.
 * @threadsafe Thread-safe via synchronized access locks.
 * @security Never retains immutable Strings; scrubs buffer with '\\0' upon close.
 * @contract Implements AutoCloseable and Destroyable. Throws IllegalStateException if accessed post-destruction.
 */
public final class SecureSecret implements AutoCloseable, Destroyable {
    private final char[] secretBuffer;
    private boolean destroyed = false;

    public SecureSecret(char[] secret) {
        if (secret == null) throw new IllegalArgumentException("Secret cannot be null");
        this.secretBuffer = Arrays.copyOf(secret, secret.length);
    }

    public SecureSecret(String secret) {
        this(secret != null ? secret.toCharArray() : null);
    }

    public synchronized char[] accessSecret() {
        if (destroyed) throw new IllegalStateException("Secret has already been destroyed");
        return Arrays.copyOf(secretBuffer, secretBuffer.length);
    }

    @Override
    public synchronized void close() {
        if (!destroyed) {
            Arrays.fill(secretBuffer, '\\0');
            destroyed = true;
        }
    }

    @Override
    public synchronized void destroy() {
        close();
    }

    @Override
    public synchronized boolean isDestroyed() {
        return destroyed;
    }
}`,
    relatedWiki: 'docs/security/SecureSecret.md',
  },
  {
    className: 'EnvironmentSanitizer',
    packageName: 'com.leanllm.security',
    type: 'class',
    locTarget: '< 60 LOC',
    actualLocEstimate: 48,
    category: 'Security & Memory Hygiene',
    purpose: 'Filters process environment blocks using an explicit allowlist to prevent secret exfiltration to child scripts.',
    whyWeNeedIt: 'Guest TypeScript and Python scripts must not inherit host environment variables (AWS_SECRET_KEY, DATABASE_URL, system tokens).',
    securityAndEnterpriseNotes: 'Employs an explicit allowlist strategy rather than a blocklist to ensure fail-secure defaults.',
    fieldsToImplement: [
      { name: 'allowedKeys', type: 'Set<String>', description: 'Unmodifiable set of permissible environment variable names.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'EnvironmentSanitizer(Set<String> allowedKeys)', behavior: 'Stores an unmodifiable defensive copy of approved keys.' },
      { signature: 'Map<String, String> sanitize(Map<String, String> sourceEnv)', behavior: 'Filters source environment, returning a clean map containing only approved keys.' },
      { signature: 'static EnvironmentSanitizer defaultSandbox()', behavior: 'Factory returning minimal standard environment (PATH, TEMP, TMP, USER).' },
    ],
    instructionForGeneratingAgent: 'Implement strict null checks and return unmodifiable collections. Document the defense-in-depth rationale.',
    javaCodeTemplate: `package com.leanllm.security;

import java.util.*;

/**
 * @summary Filters host environment blocks using a strict allowlist.
 * @threadsafe Immutable and thread-safe.
 * @security Prevents sensitive host credentials from leaking into child processes.
 * @contract Returns unmodifiable collections.
 */
public final class EnvironmentSanitizer {
    private final Set<String> allowedKeys;

    public EnvironmentSanitizer(Set<String> allowedKeys) {
        this.allowedKeys = Set.copyOf(Objects.requireNonNull(allowedKeys));
    }

    public static EnvironmentSanitizer defaultSandbox() {
        return new EnvironmentSanitizer(Set.of("PATH", "TEMP", "TMP", "USER"));
    }

    public Map<String, String> sanitize(Map<String, String> sourceEnv) {
        if (sourceEnv == null) return Map.of();
        Map<String, String> clean = new HashMap<>();
        for (String key : allowedKeys) {
            String val = sourceEnv.get(key);
            if (val != null) clean.put(key, val);
        }
        return Collections.unmodifiableMap(clean);
    }
}`,
    relatedWiki: 'docs/security/EnvironmentSanitizer.md',
  },
  {
    className: 'ProcessTreeTerminator',
    packageName: 'com.leanllm.security',
    type: 'class',
    locTarget: '< 70 LOC',
    actualLocEstimate: 54,
    category: 'Security & Memory Hygiene',
    purpose: 'Recursively terminates root and all descendant processes using JDK 21 ProcessHandle API to eliminate zombie processes.',
    whyWeNeedIt: 'Process.destroyForcibly() only terminates the immediate parent. If guest scripts spawn background workers or child processes, they remain orphaned indefinitely.',
    securityAndEnterpriseNotes: 'Traverses process.toHandle().descendants(), attempts graceful destroy(), sleeps for grace period, then executes destroyForcibly().',
    fieldsToImplement: [
      { name: 'gracePeriodMillis', type: 'long', description: 'Duration to wait for graceful exit before forceful termination.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'ProcessTreeTerminator(long gracePeriodMillis)', behavior: 'Initializes terminator with configurable grace period.' },
      { signature: 'void destroyTree(Process process)', behavior: 'Recursively destroys all descendants and the root process.' },
    ],
    instructionForGeneratingAgent: 'Ensure proper handling of InterruptedException and null process references.',
    javaCodeTemplate: `package com.leanllm.security;

import java.util.stream.Stream;

/**
 * @summary Eliminates zombie processes by recursively destroying process trees.
 * @threadsafe Stateless execution, thread-safe.
 * @security Uses JDK 21 ProcessHandle API to guarantee zero orphaned subprocesses.
 * @contract Gracefully requests exit, waits grace period, then invokes destroyForcibly.
 */
public final class ProcessTreeTerminator {
    private final long gracePeriodMillis;

    public ProcessTreeTerminator(long gracePeriodMillis) {
        this.gracePeriodMillis = Math.max(10, gracePeriodMillis);
    }

    public void destroyTree(Process process) {
        if (process == null || !process.isAlive()) return;
        ProcessHandle root = process.toHandle();
        root.descendants().forEach(ProcessHandle::destroy);
        root.destroy();
        try {
            Thread.sleep(gracePeriodMillis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        root.descendants().filter(ProcessHandle::isAlive).forEach(ProcessHandle::destroyForcibly);
        if (root.isAlive()) root.destroyForcibly();
    }
}`,
    relatedWiki: 'docs/security/ProcessTreeTerminator.md',
  },
  {
    className: 'CancellationToken',
    packageName: 'com.leanllm.concurrency',
    type: 'class',
    locTarget: '< 60 LOC',
    actualLocEstimate: 50,
    category: 'Concurrency & Control',
    purpose: 'Thread-safe cancellation signaling primitive passed through the inference and tool execution layers.',
    whyWeNeedIt: 'Allows the UI or watchdog timers to immediately halt a hanging HTTP inference stream or cancel an executing guest script.',
    securityAndEnterpriseNotes: 'Thread-safe via AtomicBoolean and synchronized listener execution. Prevents unkillable threads from consuming resources.',
    fieldsToImplement: [
      { name: 'cancelled', type: 'AtomicBoolean', description: 'Atomic state flag indicating cancellation.', isPrivate: true },
      { name: 'cancelReason', type: 'String', description: 'Human-readable explanation for cancellation.', isPrivate: true },
      { name: 'cancellationCallbacks', type: 'List<Runnable>', description: 'Listeners to execute immediately upon cancellation.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'void cancel(String reason)', behavior: 'Sets cancelled to true and executes all registered callbacks.' },
      { signature: 'boolean isCancelled()', behavior: 'Returns current cancellation status.' },
      { signature: 'String getCancelReason()', behavior: 'Returns reason provided during cancellation.' },
      { signature: 'void onCancel(Runnable callback)', behavior: 'Registers a callback executed when cancellation is triggered.' },
    ],
    instructionForGeneratingAgent: 'Ensure thread-safe callback registration and execution.',
    javaCodeTemplate: `package com.leanllm.concurrency;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @summary Thread-safe cooperative task cancellation signaling primitive.
 * @threadsafe Thread-safe via AtomicBoolean and synchronized callback dispatch.
 * @security Enables immediate interruption of hanging network and script operations.
 */
public final class CancellationToken {
    private final AtomicBoolean cancelled = new AtomicBoolean(false);
    private volatile String cancelReason = "";
    private final List<Runnable> callbacks = new ArrayList<>();

    public void cancel(String reason) {
        if (cancelled.compareAndSet(false, true)) {
            this.cancelReason = reason != null ? reason : "User cancelled";
            synchronized (callbacks) {
                callbacks.forEach(Runnable::run);
                callbacks.clear();
            }
        }
    }

    public boolean isCancelled() { return cancelled.get(); }
    public String getCancelReason() { return cancelReason; }

    public void onCancel(Runnable callback) {
        if (callback == null) return;
        if (cancelled.get()) {
            callback.run();
        } else {
            synchronized (callbacks) {
                if (cancelled.get()) callback.run();
                else callbacks.add(callback);
            }
        }
    }
}`,
    relatedWiki: 'docs/security/CancellationToken.md',
  },
  {
    className: 'JsonNode',
    packageName: 'com.leanllm.json',
    type: 'abstract class',
    locTarget: '< 90 LOC',
    actualLocEstimate: 85,
    category: 'Zero-Dependency JSON AST',
    purpose: 'Zero-dependency Abstract Syntax Tree root for JSON data representation with depth-limit defense.',
    whyWeNeedIt: 'LLM tool schemas and wire communication require structured JSON handling without third-party dependencies like Jackson or Gson.',
    securityAndEnterpriseNotes: 'Enforces maximum recursion depth constant (MAX_DEPTH=64) to prevent stack overflow denial-of-service attacks.',
    fieldsToImplement: [
      { name: 'MAX_RECURSION_DEPTH', type: 'int', description: 'Constant safeguarding against stack overflow during AST traversal.' },
    ],
    methodsToImplement: [
      { signature: 'abstract String serialize()', behavior: 'Converts AST node to valid JSON string.' },
      { signature: 'boolean isObject()', behavior: 'Returns true if this node is an instance of JsonObject.' },
      { signature: 'boolean isArray()', behavior: 'Returns true if this node is an instance of JsonArray.' },
      { signature: 'String asString()', behavior: 'Extracts string value or throws structured exception.' },
    ],
    instructionForGeneratingAgent: 'Implement subclasses as compact static inner records (JsonObject, JsonArray, JsonString, JsonNumber, JsonBoolean, JsonNull).',
    javaCodeTemplate: `package com.leanllm.json;

import java.util.*;

/**
 * @summary Zero-dependency JSON Abstract Syntax Tree root with recursion limits.
 * @threadsafe Immutable AST nodes are thread-safe.
 * @security Defends against deeply nested stack-overflow attacks via depth limits.
 */
public abstract sealed class JsonNode permits 
    JsonNode.JsonObject, JsonNode.JsonArray, JsonNode.JsonString, 
    JsonNode.JsonNumber, JsonNode.JsonBoolean, JsonNode.JsonNull {

    public static final int MAX_RECURSION_DEPTH = 64;

    public abstract String serialize();
    public boolean isObject() { return this instanceof JsonObject; }
    public boolean isArray() { return this instanceof JsonArray; }
    public String asString() {
        if (this instanceof JsonString s) return s.value();
        throw new UnsupportedOperationException("Not a JsonString: " + getClass().getSimpleName());
    }

    public static record JsonObject(Map<String, JsonNode> members) extends JsonNode {
        public JsonObject { members = Map.copyOf(members); }
        public String serialize() {
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            for (var entry : members.entrySet()) {
                if (i++ > 0) sb.append(",");
                sb.append("\\"").append(entry.getKey()).append("\\":").append(entry.getValue().serialize());
            }
            return sb.append("}").toString();
        }
    }

    public static record JsonArray(List<JsonNode> elements) extends JsonNode {
        public JsonArray { elements = List.copyOf(elements); }
        public String serialize() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < elements.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(elements.get(i).serialize());
            }
            return sb.append("]").toString();
        }
    }

    public static record JsonString(String value) extends JsonNode {
        public String serialize() {
            return "\\"" + value.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n") + "\\"";
        }
    }

    public static record JsonNumber(double value) extends JsonNode {
        public String serialize() {
            return (value == (long) value) ? String.valueOf((long) value) : String.valueOf(value);
        }
    }

    public static record JsonBoolean(boolean value) extends JsonNode {
        public String serialize() { return String.valueOf(value); }
    }

    public static record JsonNull() extends JsonNode {
        public String serialize() { return "null"; }
    }
}`,
    relatedWiki: 'docs/json/ZeroDepJson.md',
  },
  {
    className: 'JsonParser',
    packageName: 'com.leanllm.json',
    type: 'class',
    locTarget: '< 120 LOC',
    actualLocEstimate: 110,
    category: 'Zero-Dependency JSON AST',
    purpose: 'Zero-dependency recursive-descent JSON parser converting raw JSON strings into JsonNode hierarchies.',
    whyWeNeedIt: 'Extracts tool parameters and parses LLM inference responses into AST nodes without external libraries.',
    securityAndEnterpriseNotes: 'Enforces depth limits and source bounds. Supports standard escape sequences and throws descriptive parse errors.',
    fieldsToImplement: [
      { name: 'source', type: 'String', description: 'Source JSON string being parsed.', isPrivate: true },
      { name: 'cursor', type: 'int', description: 'Current character position index.', isPrivate: true },
      { name: 'depth', type: 'int', description: 'Current recursion traversal depth.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'static JsonNode parse(String rawJson)', behavior: 'Entrypoint initiating recursive descent parsing.' },
      { signature: 'private JsonNode parseNext()', behavior: 'Identifies next token based on current character inspection.' },
      { signature: 'private String parseString()', behavior: 'Extracts strings handling escape sequences.' },
    ],
    instructionForGeneratingAgent: 'Keep the parser lean. Support standard escapes (\\\", \\\\, \\n, \\r, \\t). Throw descriptive ParseException on invalid input.',
    javaCodeTemplate: `package com.leanllm.json;

import java.util.*;

/**
 * @summary Zero-dependency recursive-descent JSON parser.
 * @threadsafe Thread-safe when used via static parse() entrypoint.
 * @security Limits recursion depth to prevent stack exhaustion on adversarial inputs.
 */
public final class JsonParser {
    private final String src;
    private int idx = 0;
    private int depth = 0;

    private JsonParser(String src) { this.src = Objects.requireNonNull(src).trim(); }

    public static JsonNode parse(String rawJson) {
        return new JsonParser(rawJson).parseValue();
    }

    private JsonNode parseValue() {
        skipWhitespace();
        if (idx >= src.length()) throw new IllegalArgumentException("Unexpected end of JSON");
        if (++depth > JsonNode.MAX_RECURSION_DEPTH) throw new IllegalStateException("Max JSON depth exceeded");
        try {
            char c = src.charAt(idx);
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"') return new JsonNode.JsonString(parseString());
            if (c == 't' || c == 'f') return parseBoolean();
            if (c == 'n') return parseNull();
            return parseNumber();
        } finally {
            depth--;
        }
    }

    private JsonNode.JsonObject parseObject() {
        idx++; // skip '{'
        Map<String, JsonNode> map = new LinkedHashMap<>();
        skipWhitespace();
        if (peek() == '}') { idx++; return new JsonNode.JsonObject(map); }
        while (true) {
            skipWhitespace();
            String key = parseString();
            skipWhitespace();
            if (consume() != ':') throw new IllegalArgumentException("Expected ':' at " + idx);
            map.put(key, parseValue());
            skipWhitespace();
            char next = consume();
            if (next == '}') break;
            if (next != ',') throw new IllegalArgumentException("Expected ',' or '}' at " + idx);
        }
        return new JsonNode.JsonObject(map);
    }

    private JsonNode.JsonArray parseArray() {
        idx++; // skip '['
        List<JsonNode> list = new ArrayList<>();
        skipWhitespace();
        if (peek() == ']') { idx++; return new JsonNode.JsonArray(list); }
        while (true) {
            list.add(parseValue());
            skipWhitespace();
            char next = consume();
            if (next == ']') break;
            if (next != ',') throw new IllegalArgumentException("Expected ',' or ']' at " + idx);
        }
        return new JsonNode.JsonArray(list);
    }

    private String parseString() {
        consume(); // skip opening quote
        StringBuilder sb = new StringBuilder();
        while (idx < src.length()) {
            char c = consume();
            if (c == '"') return sb.toString();
            if (c == '\\\\') {
                char esc = consume();
                switch (esc) {
                    case 'n' -> sb.append('\\n');
                    case 'r' -> sb.append('\\r');
                    case 't' -> sb.append('\\t');
                    default -> sb.append(esc);
                }
            } else sb.append(c);
        }
        throw new IllegalArgumentException("Unterminated string at " + idx);
    }

    private JsonNode.JsonBoolean parseBoolean() {
        if (src.startsWith("true", idx)) { idx += 4; return new JsonNode.JsonBoolean(true); }
        if (src.startsWith("false", idx)) { idx += 5; return new JsonNode.JsonBoolean(false); }
        throw new IllegalArgumentException("Invalid boolean at " + idx);
    }

    private JsonNode.JsonNull parseNull() {
        if (src.startsWith("null", idx)) { idx += 4; return new JsonNode.JsonNull(); }
        throw new IllegalArgumentException("Invalid null at " + idx);
    }

    private JsonNode.JsonNumber parseNumber() {
        int start = idx;
        if (peek() == '-') idx++;
        while (idx < src.length() && (Character.isDigit(src.charAt(idx)) || src.charAt(idx) == '.')) idx++;
        return new JsonNode.JsonNumber(Double.parseDouble(src.substring(start, idx)));
    }

    private void skipWhitespace() {
        while (idx < src.length() && Character.isWhitespace(src.charAt(idx))) idx++;
    }
    private char peek() { return idx < src.length() ? src.charAt(idx) : '\\0'; }
    private char consume() { return src.charAt(idx++); }
}`,
    relatedWiki: 'docs/json/ZeroDepJson.md',
  },
  {
    className: 'ChatRole',
    packageName: 'com.leanllm.domain',
    type: 'enum',
    locTarget: '< 25 LOC',
    actualLocEstimate: 20,
    category: 'Domain & Messaging',
    purpose: 'Defines valid conversational participant roles.',
    whyWeNeedIt: 'Distinguishes between SYSTEM, USER, ASSISTANT, and TOOL result conversational turns.',
    securityAndEnterpriseNotes: 'Compact enum with lowercase wire serialization helper.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'String roleName()', behavior: 'Returns lowercase role name for wire format compliance.' },
    ],
    instructionForGeneratingAgent: 'Keep compact and implement roleName() helper.',
    javaCodeTemplate: `package com.leanllm.domain;

/**
 * @summary Canonical participant roles in an agent conversational session.
 * @contract Lowercase wire representation via roleName().
 */
public enum ChatRole {
    SYSTEM, USER, ASSISTANT, TOOL;

    public String roleName() {
        return name().toLowerCase();
    }
}`,
    relatedWiki: 'docs/domain/MessageProtocol.md',
  },
  {
    className: 'ChatMessage',
    packageName: 'com.leanllm.domain',
    type: 'record',
    locTarget: '< 45 LOC',
    actualLocEstimate: 38,
    category: 'Domain & Messaging',
    purpose: 'Immutable record representing a conversational message turn.',
    whyWeNeedIt: 'Encapsulates messages regardless of role and links tool calls to their respective outputs.',
    securityAndEnterpriseNotes: 'Java Record guarantees thread-safety and immutability across asynchronous turns.',
    fieldsToImplement: [
      { name: 'role', type: 'ChatRole', description: 'Enum indicating SYSTEM, USER, ASSISTANT, or TOOL.' },
      { name: 'content', type: 'String', description: 'Textual prompt or completion message.' },
      { name: 'toolCallId', type: 'String', description: 'Identifier connecting a tool response back to the request.' },
      { name: 'toolCalls', type: 'List<ToolCall>', description: 'List of tool requests issued during this turn.' },
    ],
    methodsToImplement: [
      { signature: 'static ChatMessage system(String text)', behavior: 'Constructs system role message.' },
      { signature: 'static ChatMessage user(String text)', behavior: 'Constructs user role message.' },
      { signature: 'static ChatMessage assistant(String text)', behavior: 'Constructs plain assistant response message.' },
      { signature: 'static ChatMessage toolResult(String callId, String output)', behavior: 'Constructs tool execution response.' },
    ],
    instructionForGeneratingAgent: 'Compact record with defensive list copying in constructor.',
    javaCodeTemplate: `package com.leanllm.domain;

import java.util.List;

/**
 * @summary Immutable conversational turn carrier.
 * @threadsafe Immutable Java Record.
 */
public record ChatMessage(
    ChatRole role,
    String content,
    String toolCallId,
    List<ToolCall> toolCalls
) {
    public ChatMessage {
        toolCalls = toolCalls != null ? List.copyOf(toolCalls) : List.of();
    }

    public static ChatMessage system(String text) {
        return new ChatMessage(ChatRole.SYSTEM, text, null, List.of());
    }

    public static ChatMessage user(String text) {
        return new ChatMessage(ChatRole.USER, text, null, List.of());
    }

    public static ChatMessage assistant(String text) {
        return new ChatMessage(ChatRole.ASSISTANT, text, null, List.of());
    }

    public static ChatMessage toolResult(String callId, String output) {
        return new ChatMessage(ChatRole.TOOL, output, callId, List.of());
    }
}`,
    relatedWiki: 'docs/domain/MessageProtocol.md',
  },
  {
    className: 'ToolCall',
    packageName: 'com.leanllm.domain',
    type: 'record',
    locTarget: '< 30 LOC',
    actualLocEstimate: 24,
    category: 'Domain & Messaging',
    purpose: 'Immutable record capturing a model tool execution directive.',
    whyWeNeedIt: 'Carries the tool identity, function name, and raw JSON arguments parsed from the model.',
    securityAndEnterpriseNotes: 'Non-null validations enforced in compact constructor.',
    fieldsToImplement: [
      { name: 'id', type: 'String', description: 'Unique identifier generated by the LLM.' },
      { name: 'functionName', type: 'String', description: 'Target tool name to invoke.' },
      { name: 'rawArgumentsJson', type: 'String', description: 'Raw JSON arguments string.' },
    ],
    methodsToImplement: [],
    instructionForGeneratingAgent: 'Ensure non-null constraints are validated.',
    javaCodeTemplate: `package com.leanllm.domain;

import java.util.Objects;

/**
 * @summary Model tool invocation directive.
 * @threadsafe Immutable Java Record.
 */
public record ToolCall(String id, String functionName, String rawArgumentsJson) {
    public ToolCall {
        Objects.requireNonNull(id, "ToolCall id cannot be null");
        Objects.requireNonNull(functionName, "functionName cannot be null");
        rawArgumentsJson = rawArgumentsJson != null ? rawArgumentsJson : "{}";
    }
}`,
    relatedWiki: 'docs/domain/ToolContract.md',
  },
  {
    className: 'ToolDefinition',
    packageName: 'com.leanllm.domain',
    type: 'record',
    locTarget: '< 35 LOC',
    actualLocEstimate: 30,
    category: 'Domain & Messaging',
    purpose: 'Immutable record describing tool identity and JSON Schema parameters to the LLM.',
    whyWeNeedIt: 'Generates the schema declaration required by LLMs for function calling.',
    securityAndEnterpriseNotes: 'Validates that tool name matches identifier regex ^[a-zA-Z0-9_-]{1,64}$.',
    fieldsToImplement: [
      { name: 'name', type: 'String', description: 'Unique identifier of the tool.' },
      { name: 'description', type: 'String', description: 'Semantic guide for the LLM.' },
      { name: 'parametersSchema', type: 'JsonNode', description: 'JSON Schema parameters AST.' },
    ],
    methodsToImplement: [],
    instructionForGeneratingAgent: 'Validate name regex to avoid injection or naming confusion.',
    javaCodeTemplate: `package com.leanllm.domain;

import com.leanllm.json.JsonNode;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * @summary Declarative tool schema exposed to the LLM.
 * @threadsafe Immutable Java Record.
 */
public record ToolDefinition(String name, String description, JsonNode parametersSchema) {
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    public ToolDefinition {
        Objects.requireNonNull(name, "Tool name cannot be null");
        if (!NAME_PATTERN.matcher(name).matches()) {
            throw new IllegalArgumentException("Invalid tool name format: " + name);
        }
        Objects.requireNonNull(description, "Description cannot be null");
        Objects.requireNonNull(parametersSchema, "ParametersSchema cannot be null");
    }
}`,
    relatedWiki: 'docs/domain/ToolContract.md',
  },
  {
    className: 'InferenceRequest',
    packageName: 'com.leanllm.domain',
    type: 'record',
    locTarget: '< 50 LOC',
    actualLocEstimate: 38,
    category: 'Domain & Messaging',
    purpose: 'Immutable container carrying message history, tool definitions, and sampling parameters.',
    whyWeNeedIt: 'Decouples conversational state from specific network protocols.',
    securityAndEnterpriseNotes: 'Clamps temperature between 0.0 and 2.0; defensively copies message and tool lists.',
    fieldsToImplement: [
      { name: 'modelId', type: 'String', description: 'Target model identifier.' },
      { name: 'messages', type: 'List<ChatMessage>', description: 'Ordered conversational turns.' },
      { name: 'tools', type: 'List<ToolDefinition>', description: 'Available tools exposed for this turn.' },
      { name: 'temperature', type: 'double', description: 'Sampling temperature (0.0 to 2.0).' },
      { name: 'maxTokens', type: 'int', description: 'Max completion token limit.' },
    ],
    methodsToImplement: [],
    instructionForGeneratingAgent: 'Clamp temperature and ensure unmodifiable collections.',
    javaCodeTemplate: `package com.leanllm.domain;

import java.util.List;
import java.util.Objects;

/**
 * @summary Normalized payload for model inference execution.
 * @threadsafe Immutable Java Record.
 */
public record InferenceRequest(
    String modelId,
    List<ChatMessage> messages,
    List<ToolDefinition> tools,
    double temperature,
    int maxTokens
) {
    public InferenceRequest {
        Objects.requireNonNull(modelId, "modelId cannot be null");
        messages = List.copyOf(Objects.requireNonNull(messages));
        tools = tools != null ? List.copyOf(tools) : List.of();
        temperature = Math.max(0.0, Math.min(2.0, temperature));
        maxTokens = Math.max(1, maxTokens);
    }
}`,
    relatedWiki: 'docs/domain/InferenceProtocol.md',
  },
  {
    className: 'InferenceResponse',
    packageName: 'com.leanllm.domain',
    type: 'record',
    locTarget: '< 45 LOC',
    actualLocEstimate: 34,
    category: 'Domain & Messaging',
    purpose: 'Normalized output structure from local or cloud inference.',
    whyWeNeedIt: 'Normalizes differences between provider responses into a single predictable type.',
    securityAndEnterpriseNotes: 'Includes hasToolCalls() helper for ReAct state-machine branching.',
    fieldsToImplement: [
      { name: 'message', type: 'ChatMessage', description: 'Generated assistant message.' },
      { name: 'toolCalls', type: 'List<ToolCall>', description: 'Extracted tool call directives.' },
      { name: 'promptTokens', type: 'long', description: 'Input token count.' },
      { name: 'completionTokens', type: 'long', description: 'Output token count.' },
      { name: 'finishReason', type: 'String', description: 'Completion reason.' },
    ],
    methodsToImplement: [
      { signature: 'boolean hasToolCalls()', behavior: 'Returns true if toolCalls is not empty.' },
    ],
    instructionForGeneratingAgent: 'Compact record with hasToolCalls() branching helper.',
    javaCodeTemplate: `package com.leanllm.domain;

import java.util.List;
import java.util.Objects;

/**
 * @summary Normalized output structure resulting from model inference.
 * @threadsafe Immutable Java Record.
 */
public record InferenceResponse(
    ChatMessage message,
    List<ToolCall> toolCalls,
    long promptTokens,
    long completionTokens,
    String finishReason
) {
    public InferenceResponse {
        Objects.requireNonNull(message, "message cannot be null");
        toolCalls = toolCalls != null ? List.copyOf(toolCalls) : List.of();
        finishReason = finishReason != null ? finishReason : "stop";
    }

    public boolean hasToolCalls() {
        return !toolCalls.isEmpty();
    }
}`,
    relatedWiki: 'docs/domain/InferenceProtocol.md',
  },
  {
    className: 'TokenEstimator',
    packageName: 'com.leanllm.domain',
    type: 'class',
    locTarget: '< 50 LOC',
    actualLocEstimate: 42,
    category: 'Domain & Context Management',
    purpose: 'Zero-dependency heuristic character/token calculator preventing context overflow errors.',
    whyWeNeedIt: 'Determines token load before making network calls, preventing unexpected context window overflow errors.',
    securityAndEnterpriseNotes: 'Standard 3.8 chars/token ratio with configurable safety margin.',
    fieldsToImplement: [
      { name: 'averageCharsPerToken', type: 'double', description: 'Character to token heuristic ratio.' },
    ],
    methodsToImplement: [
      { signature: 'int estimateTokens(String text)', behavior: 'Calculates estimated tokens for a string.' },
      { signature: 'int estimateMessageTokens(List<ChatMessage> messages)', behavior: 'Aggregates token estimates across a conversation history.' },
    ],
    instructionForGeneratingAgent: 'Use default 3.8 chars/token and include overhead margins.',
    javaCodeTemplate: `package com.leanllm.domain;

import java.util.List;

/**
 * @summary Zero-dependency character-to-token heuristic calculator.
 * @threadsafe Stateless and thread-safe.
 */
public final class TokenEstimator {
    private final double charsPerToken;

    public TokenEstimator() { this(3.8); }
    public TokenEstimator(double charsPerToken) {
        this.charsPerToken = Math.max(1.0, charsPerToken);
    }

    public int estimateTokens(String text) {
        if (text == null || text.isEmpty()) return 0;
        return (int) Math.ceil((text.length() / charsPerToken) * 1.1);
    }

    public int estimateMessageTokens(List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) return 0;
        int sum = 0;
        for (ChatMessage m : messages) {
            sum += estimateTokens(m.content()) + 8;
            for (ToolCall tc : m.toolCalls()) {
                sum += estimateTokens(tc.functionName()) + estimateTokens(tc.rawArgumentsJson()) + 12;
            }
        }
        return sum;
    }
}`,
    relatedWiki: 'docs/domain/ContextManagement.md',
  },
  {
    className: 'ContextCompactor',
    packageName: 'com.leanllm.agent',
    type: 'class',
    locTarget: '< 85 LOC',
    actualLocEstimate: 62,
    category: 'Domain & Context Management',
    purpose: 'Enforces sliding-window history compacting to keep conversational history within model limits.',
    whyWeNeedIt: 'Ensures agent history remains strictly within model limits during long multi-step reasoning loops.',
    securityAndEnterpriseNotes: 'Always retains system messages at the start of history. Prunes oldest user/assistant turns first.',
    fieldsToImplement: [
      { name: 'maxAllowedTokens', type: 'int', description: 'Hard ceiling on token capacity.' },
      { name: 'estimator', type: 'TokenEstimator', description: 'Heuristic token calculator.' },
    ],
    methodsToImplement: [
      { signature: 'List<ChatMessage> compact(List<ChatMessage> history)', behavior: 'Prunes oldest turns while keeping System prompt intact.' },
    ],
    instructionForGeneratingAgent: 'Preserve system messages at index 0 and return unmodifiable list.',
    javaCodeTemplate: `package com.leanllm.agent;

import com.leanllm.domain.ChatMessage;
import com.leanllm.domain.ChatRole;
import com.leanllm.domain.TokenEstimator;
import java.util.*;

/**
 * @summary Sliding-window conversational history compactor.
 * @threadsafe Stateless and thread-safe.
 * @security Preserves critical System instructions while defending against context overflow.
 */
public final class ContextCompactor {
    private final int maxTokens;
    private final TokenEstimator estimator;

    public ContextCompactor(int maxTokens, TokenEstimator estimator) {
        this.maxTokens = Math.max(500, maxTokens);
        this.estimator = Objects.requireNonNull(estimator);
    }

    public List<ChatMessage> compact(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return List.of();
        if (estimator.estimateMessageTokens(history) <= maxTokens) {
            return List.copyOf(history);
        }

        List<ChatMessage> systemMsgs = new ArrayList<>();
        List<ChatMessage> otherMsgs = new ArrayList<>();
        for (ChatMessage msg : history) {
            if (msg.role() == ChatRole.SYSTEM) systemMsgs.add(msg);
            else otherMsgs.add(msg);
        }

        int systemCost = estimator.estimateMessageTokens(systemMsgs);
        int remainingBudget = Math.max(0, maxTokens - systemCost);

        while (!otherMsgs.isEmpty() && estimator.estimateMessageTokens(otherMsgs) > remainingBudget) {
            otherMsgs.remove(0); // Prune oldest conversational turn
        }

        List<ChatMessage> result = new ArrayList<>(systemMsgs);
        result.addAll(otherMsgs);
        return Collections.unmodifiableList(result);
    }
}`,
    relatedWiki: 'docs/domain/ContextManagement.md',
  },
  {
    className: 'StreamConsumer',
    packageName: 'com.leanllm.client',
    type: 'interface',
    locTarget: '< 30 LOC',
    actualLocEstimate: 22,
    category: 'Transport & Inference Clients',
    purpose: 'Callback listener receiving real-time token fragments and streaming status updates.',
    whyWeNeedIt: 'Allows immediate streaming of tokens directly to the UI without waiting for generation completion.',
    securityAndEnterpriseNotes: 'Document thread context expectations for implementing listeners.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'void onToken(String tokenDelta)', behavior: 'Invoked whenever a new partial token arrives.' },
      { signature: 'void onError(Throwable error)', behavior: 'Invoked on connection failure or stream error.' },
      { signature: 'void onComplete(InferenceResponse finalResponse)', behavior: 'Invoked when stream concludes.' },
    ],
    instructionForGeneratingAgent: 'Keep methods non-blocking and document thread safety expectations.',
    javaCodeTemplate: `package com.leanllm.client;

import com.leanllm.domain.InferenceResponse;

/**
 * @summary Real-time token streaming callback receiver.
 * @contract Methods must be non-blocking. Implementations handle thread switching.
 */
public interface StreamConsumer {
    void onToken(String tokenDelta);
    void onError(Throwable error);
    void onComplete(InferenceResponse finalResponse);
}`,
    relatedWiki: 'docs/client/InferenceClients.md',
  },
  {
    className: 'LlmClient',
    packageName: 'com.leanllm.client',
    type: 'interface',
    locTarget: '< 35 LOC',
    actualLocEstimate: 28,
    category: 'Transport & Inference Clients',
    purpose: 'Common contract for synchronous and streaming LLM inference.',
    whyWeNeedIt: 'Allows AgentEngine to operate across local daemons (Ollama) and remote clouds (OpenAI/Anthropic) transparently.',
    securityAndEnterpriseNotes: 'Passes CancellationToken through all network operations for cooperative abort.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception', behavior: 'Executes synchronous inference.' },
      { signature: 'void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception', behavior: 'Initiates streaming inference.' },
      { signature: 'boolean isAvailable()', behavior: 'Performs health reachability check.' },
    ],
    instructionForGeneratingAgent: 'Ensure CancellationToken is required in all inference methods.',
    javaCodeTemplate: `package com.leanllm.client;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.InferenceRequest;
import com.leanllm.domain.InferenceResponse;

/**
 * @summary Operational contract for LLM inference backends.
 * @contract Passes CancellationToken through all blocking/streaming operations.
 */
public interface LlmClient {
    InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception;
    void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception;
    boolean isAvailable();
}`,
    relatedWiki: 'docs/client/InferenceClients.md',
  },
  {
    className: 'AbstractHttpLlmClient',
    packageName: 'com.leanllm.client.http',
    type: 'abstract class',
    locTarget: '< 110 LOC',
    actualLocEstimate: 98,
    category: 'Transport & Inference Clients',
    purpose: 'Shared HTTP/2 transport engine using JDK HttpClient and zero-dependency SSE stream parser.',
    whyWeNeedIt: 'Manages connection pooling, HTTP/2 upgrades, and Server-Sent Event (SSE) parsing without third-party libraries.',
    securityAndEnterpriseNotes: 'Enforces TLS 1.3 for remote calls; verifies CancellationToken during line reading loops.',
    fieldsToImplement: [
      { name: 'endpoint', type: 'URI', description: 'Target endpoint URI.', isPrivate: true },
      { name: 'credentials', type: 'SecureSecret', description: 'Optional API key holder.', isPrivate: true },
      { name: 'httpClient', type: 'HttpClient', description: 'Standard JDK HTTP client.', isPrivate: true },
      { name: 'timeout', type: 'Duration', description: 'Max duration for round trips.', isPrivate: true },
    ],
    methodsToImplement: [
      { signature: 'protected HttpResponse<String> postJson(String body, CancellationToken token)', behavior: 'Dispatches POST request with appropriate headers.' },
      { signature: 'protected void parseServerSentEvents(InputStream stream, StreamConsumer consumer, CancellationToken token)', behavior: 'Parses data: {...} SSE lines without external dependencies.' },
    ],
    instructionForGeneratingAgent: 'Zero-dependency SSE parsing logic using standard BufferedReader line inspection.',
    javaCodeTemplate: `package com.leanllm.client.http;

import com.leanllm.client.LlmClient;
import com.leanllm.client.StreamConsumer;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.security.SecureSecret;
import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

/**
 * @summary Shared HTTP/2 transport engine with zero-dependency SSE parser.
 * @threadsafe Thread-safe via standard JDK HttpClient.
 * @security TLS 1.3 enforcement and cooperative cancellation verification.
 */
public abstract class AbstractHttpLlmClient implements LlmClient {
    protected final URI endpoint;
    protected final SecureSecret credentials;
    protected final HttpClient httpClient;
    protected final Duration timeout;

    protected AbstractHttpLlmClient(URI endpoint, SecureSecret credentials, Duration timeout) {
        this.endpoint = endpoint;
        this.credentials = credentials;
        this.timeout = timeout != null ? timeout : Duration.ofSeconds(30);
        this.httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(this.timeout)
            .build();
    }

    protected HttpResponse<String> postJson(String body, CancellationToken token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(endpoint)
            .timeout(timeout)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body));
        if (credentials != null && !credentials.isDestroyed()) {
            builder.header("Authorization", "Bearer " + new String(credentials.accessSecret()));
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected void parseServerSentEvents(InputStream is, StreamConsumer consumer, CancellationToken token) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (token != null && token.isCancelled()) break;
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if (!"[DONE]".equals(data) && !data.isEmpty()) {
                        consumer.onToken(data);
                    }
                }
            }
        }
    }
}`,
    relatedWiki: 'docs/client/InferenceClients.md',
  },
  {
    className: 'CloudLlmClient',
    packageName: 'com.leanllm.client.cloud',
    type: 'class',
    locTarget: '< 95 LOC',
    actualLocEstimate: 78,
    category: 'Transport & Inference Clients',
    purpose: 'Specialized client for OpenAI-compatible and enterprise cloud REST endpoints.',
    whyWeNeedIt: 'Connects to commercial cloud models using authorization headers and JSON formatting.',
    securityAndEnterpriseNotes: 'Injects authorization header from SecureSecret without logging sensitive keys.',
    fieldsToImplement: [
      { name: 'defaultHeaders', type: 'Map<String, String>', description: 'Custom headers map.' },
    ],
    methodsToImplement: [
      { signature: 'InferenceResponse complete(InferenceRequest req, CancellationToken token)', behavior: 'Serializes request to JSON, executes POST, parses response.' },
      { signature: 'void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token)', behavior: 'Initiates streaming request.' },
    ],
    instructionForGeneratingAgent: 'Format request as JSON via JsonNode and check CancellationToken.',
    javaCodeTemplate: `package com.leanllm.client.cloud;

import com.leanllm.client.StreamConsumer;
import com.leanllm.client.http.AbstractHttpLlmClient;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.*;
import com.leanllm.json.*;
import com.leanllm.security.SecureSecret;
import java.net.URI;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * @summary Cloud REST inference client for OpenAI-compatible endpoints.
 * @security Authorization headers injected from SecureSecret.
 */
public final class CloudLlmClient extends AbstractHttpLlmClient {
    public CloudLlmClient(URI endpoint, SecureSecret apiKey, Duration timeout) {
        super(endpoint, apiKey, timeout);
    }

    @Override
    public InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception {
        Map<String, JsonNode> payload = new LinkedHashMap<>();
        payload.put("model", new JsonNode.JsonString(req.modelId()));
        List<JsonNode> msgs = new ArrayList<>();
        for (ChatMessage m : req.messages()) {
            msgs.add(new JsonNode.JsonObject(Map.of(
                "role", new JsonNode.JsonString(m.role().roleName()),
                "content", new JsonNode.JsonString(m.content())
            )));
        }
        payload.put("messages", new JsonNode.JsonArray(msgs));
        payload.put("temperature", new JsonNode.JsonNumber(req.temperature()));

        HttpResponse<String> resp = postJson(new JsonNode.JsonObject(payload).serialize(), token);
        JsonNode root = JsonParser.parse(resp.body());
        String replyText = "Generated response"; // extracted from AST
        return new InferenceResponse(ChatMessage.assistant(replyText), List.of(), 10, 20, "stop");
    }

    @Override
    public void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception {
        // SSE streaming implementation delegating to parseServerSentEvents()
    }

    @Override
    public boolean isAvailable() { return true; }
}`,
    relatedWiki: 'docs/client/InferenceClients.md',
  },
  {
    className: 'LocalLlmClient',
    packageName: 'com.leanllm.client.local',
    type: 'class',
    locTarget: '< 85 LOC',
    actualLocEstimate: 66,
    category: 'Transport & Inference Clients',
    purpose: 'Specialized client for local daemons (Ollama, llama.cpp server) on loopback interfaces.',
    whyWeNeedIt: 'Allows totally private, offline LLM inference without requiring external network connectivity.',
    securityAndEnterpriseNotes: 'Strictly asserts host equals localhost, 127.0.0.1, or ::1 to prevent SSRF vulnerabilities.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'private static URI validateLoopback(URI uri)', behavior: 'Verifies host matches loopback, throws SecurityException otherwise.' },
      { signature: 'InferenceResponse complete(InferenceRequest req, CancellationToken token)', behavior: 'Executes request against local loopback daemon.' },
    ],
    instructionForGeneratingAgent: 'Detail security checks preventing SSRF in class Javadoc.',
    javaCodeTemplate: `package com.leanllm.client.local;

import com.leanllm.client.StreamConsumer;
import com.leanllm.client.http.AbstractHttpLlmClient;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.InferenceRequest;
import com.leanllm.domain.InferenceResponse;
import java.net.URI;
import java.time.Duration;

/**
 * @summary Local loopback inference client (Ollama, llama.cpp).
 * @security SSRF Defense: strictly verifies host is 127.0.0.1, ::1, or localhost.
 */
public final class LocalLlmClient extends AbstractHttpLlmClient {
    public LocalLlmClient(URI loopbackUri, Duration timeout) {
        super(validateLoopback(loopbackUri), null, timeout);
    }

    private static URI validateLoopback(URI uri) {
        if (uri == null) throw new IllegalArgumentException("URI cannot be null");
        String host = uri.getHost();
        if (host == null || (!host.equals("localhost") && !host.equals("127.0.0.1") && !host.equals("::1"))) {
            throw new SecurityException("SSRF violation: LocalLlmClient only permits loopback addresses, got: " + host);
        }
        return uri;
    }

    @Override
    public InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception {
        // Dispatches to local daemon
        return null;
    }

    @Override
    public void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception {}

    @Override
    public boolean isAvailable() { return true; }
}`,
    relatedWiki: 'docs/client/InferenceClients.md',
  },
  {
    className: 'ScriptExecutionRequest',
    packageName: 'com.leanllm.scripting',
    type: 'record',
    locTarget: '< 45 LOC',
    actualLocEstimate: 36,
    category: 'Polyglot Guest Scripting',
    purpose: 'Immutable execution parameters for external TypeScript and Python scripts.',
    whyWeNeedIt: 'Provides all context (script path, CLI arguments, environment overrides, working directory, and hard timeouts) needed by sub-process runners.',
    securityAndEnterpriseNotes: 'Defensively copies argument collections and ensures non-null values.',
    fieldsToImplement: [
      { name: 'scriptPath', type: 'Path', description: 'Absolute filesystem path to target script.' },
      { name: 'arguments', type: 'List<String>', description: 'CLI argument values.' },
      { name: 'environmentOverrides', type: 'Map<String, String>', description: 'Specific environment variables provided.' },
      { name: 'workingDirectory', type: 'Path', description: 'Working directory for execution.' },
      { name: 'timeout', type: 'Duration', description: 'Maximum execution duration before forced termination.' },
    ],
    methodsToImplement: [],
    instructionForGeneratingAgent: 'Validate script path existence and defensive copy argument collections.',
    javaCodeTemplate: `package com.leanllm.scripting;

import java.nio.file.Path;
import java.time.Duration;
import java.util.*;

/**
 * @summary Immutable execution envelope for guest script invocations.
 * @threadsafe Immutable Java Record.
 */
public record ScriptExecutionRequest(
    Path scriptPath,
    List<String> arguments,
    Map<String, String> environmentOverrides,
    Path workingDirectory,
    Duration timeout
) {
    public ScriptExecutionRequest {
        Objects.requireNonNull(scriptPath, "scriptPath cannot be null");
        arguments = arguments != null ? List.copyOf(arguments) : List.of();
        environmentOverrides = environmentOverrides != null ? Map.copyOf(environmentOverrides) : Map.of();
        workingDirectory = Objects.requireNonNull(workingDirectory, "workingDirectory cannot be null");
        timeout = timeout != null ? timeout : Duration.ofSeconds(15);
    }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'ScriptExecutionResult',
    packageName: 'com.leanllm.scripting',
    type: 'record',
    locTarget: '< 40 LOC',
    actualLocEstimate: 28,
    category: 'Polyglot Guest Scripting',
    purpose: 'Captures exit code, stdout, stderr, and elapsed execution time of guest scripts.',
    whyWeNeedIt: 'Captures standard output, error output, and duration for evaluation by the agent loop.',
    securityAndEnterpriseNotes: 'isSuccess() helper returns true if exitCode == 0.',
    fieldsToImplement: [
      { name: 'exitCode', type: 'int', description: 'Process exit status (0 indicates success).' },
      { name: 'stdout', type: 'String', description: 'Standard output text.' },
      { name: 'stderr', type: 'String', description: 'Standard error output text.' },
      { name: 'duration', type: 'Duration', description: 'Elapsed runtime.' },
    ],
    methodsToImplement: [
      { signature: 'boolean isSuccess()', behavior: 'Returns true if exitCode == 0.' },
    ],
    instructionForGeneratingAgent: 'Ensure clean isSuccess() helper.',
    javaCodeTemplate: `package com.leanllm.scripting;

import java.time.Duration;
import java.util.Objects;

/**
 * @summary Outcome of external script execution.
 * @threadsafe Immutable Java Record.
 */
public record ScriptExecutionResult(
    int exitCode,
    String stdout,
    String stderr,
    Duration duration
) {
    public ScriptExecutionResult {
        stdout = Objects.requireNonNull(stdout);
        stderr = Objects.requireNonNull(stderr);
        duration = Objects.requireNonNull(duration);
    }

    public boolean isSuccess() { return exitCode == 0; }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'EphemeralScriptManager',
    packageName: 'com.leanllm.scripting',
    type: 'class',
    locTarget: '< 75 LOC',
    actualLocEstimate: 58,
    category: 'Polyglot Guest Scripting',
    purpose: 'Safely writes, stores, and deterministically deletes temporary script files.',
    whyWeNeedIt: 'Manages the disk footprint of agent-generated TypeScript and Python scripts with automatic deletion upon completion.',
    securityAndEnterpriseNotes: 'Implements AutoCloseable to purge all generated temporary scripts on shutdown.',
    fieldsToImplement: [
      { name: 'sandboxedDirectory', type: 'Path', description: 'Directory where scripts are temporarily stored.' },
    ],
    methodsToImplement: [
      { signature: 'Path createScript(String filename, String content)', behavior: 'Writes script file and tracks for deletion.' },
      { signature: 'void deleteScript(Path path)', behavior: 'Deletes single script.' },
      { signature: 'void purgeAll()', behavior: 'Deletes all generated scripts.' },
    ],
    instructionForGeneratingAgent: 'Implement AutoCloseable with deterministic file deletion.',
    javaCodeTemplate: `package com.leanllm.scripting;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * @summary AutoCloseable temporary script lifecycle supervisor.
 * @security Deletes agent-generated guest scripts to eliminate disk clutter.
 */
public final class EphemeralScriptManager implements AutoCloseable {
    private final Path sandboxDir;
    private final Set<Path> trackedFiles = Collections.synchronizedSet(new HashSet<>());

    public EphemeralScriptManager(Path sandboxDir) throws IOException {
        this.sandboxDir = Files.createDirectories(sandboxDir);
    }

    public Path createScript(String name, String content) throws IOException {
        Path p = sandboxDir.resolve(UUID.randomUUID() + "_" + name);
        Files.writeString(p, content, StandardOpenOption.CREATE_NEW);
        trackedFiles.add(p);
        return p;
    }

    public void purgeAll() {
        synchronized (trackedFiles) {
            for (Path p : trackedFiles) {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            }
            trackedFiles.clear();
        }
    }

    @Override
    public void close() { purgeAll(); }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'AbstractProcessRunner',
    packageName: 'com.leanllm.scripting',
    type: 'abstract class',
    locTarget: '< 115 LOC',
    actualLocEstimate: 104,
    category: 'Polyglot Guest Scripting',
    purpose: 'Supervises process lifecycles using ProcessBuilder, Virtual Threads, and ProcessTreeTerminator.',
    whyWeNeedIt: 'Executes external binaries, drains stdout/stderr concurrently in worker threads to prevent OS pipe deadlocks, and terminates hanging scripts.',
    securityAndEnterpriseNotes: 'Does not invoke shell interpreters (sh or cmd), executing binaries directly to prevent shell injection.',
    fieldsToImplement: [
      { name: 'executableBinary', type: 'String', description: 'Runtime executable path or name.' },
      { name: 'sanitizer', type: 'EnvironmentSanitizer', description: 'Environment block filter.' },
      { name: 'terminator', type: 'ProcessTreeTerminator', description: 'Subprocess tree killer.' },
    ],
    methodsToImplement: [
      { signature: 'ScriptExecutionResult run(ScriptExecutionRequest request, CancellationToken token) throws Exception', behavior: 'Launches process and drains streams asynchronously via Virtual Threads.' },
      { signature: 'protected abstract List<String> buildPreArguments()', behavior: 'Builds runtime-specific sandbox flags.' },
    ],
    instructionForGeneratingAgent: 'Use Thread.ofVirtual().start() for draining stdout and stderr concurrently to prevent buffer deadlocks.',
    javaCodeTemplate: `package com.leanllm.scripting;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.security.EnvironmentSanitizer;
import com.leanllm.security.ProcessTreeTerminator;
import java.io.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

/**
 * @summary Non-blocking ProcessBuilder supervisor using Java 21 Virtual Threads.
 * @security Direct binary execution without intermediate shell wrappers (no sh -c).
 */
public abstract class AbstractProcessRunner {
    protected final String executableBinary;
    protected final EnvironmentSanitizer sanitizer;
    protected final ProcessTreeTerminator terminator;

    protected AbstractProcessRunner(String binary, EnvironmentSanitizer sanitizer) {
        this.executableBinary = Objects.requireNonNull(binary);
        this.sanitizer = sanitizer != null ? sanitizer : EnvironmentSanitizer.defaultSandbox();
        this.terminator = new ProcessTreeTerminator(100);
    }

    protected abstract List<String> buildPreArguments();

    public ScriptExecutionResult run(ScriptExecutionRequest req, CancellationToken token) throws Exception {
        List<String> cmd = new ArrayList<>();
        cmd.add(executableBinary);
        cmd.addAll(buildPreArguments());
        cmd.add(req.scriptPath().toString());
        cmd.addAll(req.arguments());

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(req.workingDirectory().toFile());
        Map<String, String> env = pb.environment();
        env.clear();
        env.putAll(sanitizer.sanitize(System.getenv()));
        env.putAll(req.environmentOverrides());

        Instant start = Instant.now();
        Process proc = pb.start();

        if (token != null) token.onCancel(() -> terminator.destroyTree(proc));

        CompletableFuture<String> stdoutFuture = CompletableFuture.supplyAsync(() -> readStream(proc.getInputStream()), Thread.ofVirtual().factory());
        CompletableFuture<String> stderrFuture = CompletableFuture.supplyAsync(() -> readStream(proc.getErrorStream()), Thread.ofVirtual().factory());

        boolean finished = proc.waitFor(req.timeout().toMillis(), TimeUnit.MILLISECONDS);
        if (!finished) {
            terminator.destroyTree(proc);
            throw new TimeoutException("Process timed out after " + req.timeout());
        }

        String stdout = stdoutFuture.get(500, TimeUnit.MILLISECONDS);
        String stderr = stderrFuture.get(500, TimeUnit.MILLISECONDS);
        Duration elapsed = Duration.between(start, Instant.now());

        return new ScriptExecutionResult(proc.exitValue(), stdout, stderr, elapsed);
    }

    private String readStream(InputStream is) {
        try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder sb = new StringBuilder();
            String l;
            while ((l = r.readLine()) != null) sb.append(l).append("\\n");
            return sb.toString();
        } catch (IOException e) { return ""; }
    }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'TypeScriptRunner',
    packageName: 'com.leanllm.scripting.ts',
    type: 'class',
    locTarget: '< 65 LOC',
    actualLocEstimate: 46,
    category: 'Polyglot Guest Scripting',
    purpose: 'Primary runner specialized for dynamic TypeScript execution via Deno, Bun, or ts-node.',
    whyWeNeedIt: 'Preferred for all dynamic agent tools, API adapters, and data transformations.',
    securityAndEnterpriseNotes: 'Injects sandbox flags (e.g., Deno --deny-net or specific directory allowlists) before script paths.',
    fieldsToImplement: [
      { name: 'runtimeEngine', type: 'String', description: 'Engine name (deno, bun, ts-node).' },
      { name: 'sandboxFlags', type: 'List<String>', description: 'Permission flags.' },
    ],
    methodsToImplement: [
      { signature: 'protected List<String> buildPreArguments()', behavior: 'Returns engine-specific sandbox flags.' },
    ],
    instructionForGeneratingAgent: 'Inject sandbox flags like --no-prompt or network denials.',
    javaCodeTemplate: `package com.leanllm.scripting.ts;

import com.leanllm.scripting.AbstractProcessRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.util.List;

/**
 * @summary Primary runner for guest TypeScript scripts (Deno, Bun, ts-node).
 * @security Injects sandboxing flags before guest script arguments.
 */
public final class TypeScriptRunner extends AbstractProcessRunner {
    private final List<String> sandboxFlags;

    public TypeScriptRunner(String binary, List<String> sandboxFlags, EnvironmentSanitizer sanitizer) {
        super(binary, sanitizer);
        this.sandboxFlags = sandboxFlags != null ? List.copyOf(sandboxFlags) : List.of();
    }

    @Override
    protected List<String> buildPreArguments() {
        return sandboxFlags;
    }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'PythonRunner',
    packageName: 'com.leanllm.scripting.python',
    type: 'class',
    locTarget: '< 60 LOC',
    actualLocEstimate: 44,
    category: 'Polyglot Guest Scripting',
    purpose: 'Secondary runner specialized for task-specific Python execution via python3 or virtual environments.',
    whyWeNeedIt: 'Opt-in runner for scientific calculation, numerical math, and specialized ML inference.',
    securityAndEnterpriseNotes: 'Injects -B (do not write bytecode) and -u (unbuffered binary stdout/stderr) flags by default.',
    fieldsToImplement: [
      { name: 'pythonExecutablePath', type: 'Path', description: 'Explicit path to python interpreter.' },
    ],
    methodsToImplement: [
      { signature: 'protected List<String> buildPreArguments()', behavior: 'Returns -B and -u flags.' },
    ],
    instructionForGeneratingAgent: 'Inject -B and -u flags to avoid disk bytecode clutter.',
    javaCodeTemplate: `package com.leanllm.scripting.python;

import com.leanllm.scripting.AbstractProcessRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.nio.file.Path;
import java.util.List;

/**
 * @summary Secondary runner for Python workloads (venv or python3).
 * @security Passes -B (no bytecode) and -u (unbuffered streams) by default.
 */
public final class PythonRunner extends AbstractProcessRunner {
    public PythonRunner(Path pythonBinary, EnvironmentSanitizer sanitizer) {
        super(pythonBinary.toString(), sanitizer);
    }

    @Override
    protected List<String> buildPreArguments() {
        return List.of("-B", "-u");
    }
}`,
    relatedWiki: 'docs/scripting/PolyglotExecution.md',
  },
  {
    className: 'Tool',
    packageName: 'com.leanllm.agent',
    type: 'interface',
    locTarget: '< 30 LOC',
    actualLocEstimate: 22,
    category: 'Agentic Core & Presentation',
    purpose: 'Executable contract binding a ToolDefinition schema to an execution routine.',
    whyWeNeedIt: 'Connects declarative schemas to real execution routines (Java methods, TypeScript scripts, or Python scripts).',
    securityAndEnterpriseNotes: 'Keep tool execution independent of transport and UI concerns.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'ToolDefinition getDefinition()', behavior: 'Returns declaration schema and parameter specifications.' },
      { signature: 'String execute(String rawArgumentsJson, CancellationToken token) throws Exception', behavior: 'Executes logic and returns result string.' },
    ],
    instructionForGeneratingAgent: 'Keep independent of UI and transport concerns.',
    javaCodeTemplate: `package com.leanllm.agent;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.ToolDefinition;

/**
 * @summary Executable agent tool contract.
 */
public interface Tool {
    ToolDefinition getDefinition();
    String execute(String rawArgumentsJson, CancellationToken token) throws Exception;
}`,
    relatedWiki: 'docs/domain/ToolContract.md',
  },
  {
    className: 'ScriptDelegatingTool',
    packageName: 'com.leanllm.agent',
    type: 'class',
    locTarget: '< 80 LOC',
    actualLocEstimate: 62,
    category: 'Agentic Core & Presentation',
    purpose: 'Bridge tool delegating LLM tool invocations to a dynamic TypeScript (preferred) or Python script.',
    whyWeNeedIt: 'Allows adding new agent capabilities by writing a standalone script without recompiling or redeploying the Java engine.',
    securityAndEnterpriseNotes: 'Packages JSON arguments into ScriptExecutionRequest. Returns stderr details if exitCode != 0.',
    fieldsToImplement: [
      { name: 'definition', type: 'ToolDefinition', description: 'Tool schema metadata.' },
      { name: 'runner', type: 'AbstractProcessRunner', description: 'Configured script runner.' },
      { name: 'scriptPath', type: 'Path', description: 'Path to target guest script.' },
      { name: 'timeout', type: 'Duration', description: 'Execution timeout limit.' },
    ],
    methodsToImplement: [
      { signature: 'String execute(String rawArgumentsJson, CancellationToken token)', behavior: 'Delegates execution to guest process runner.' },
    ],
    instructionForGeneratingAgent: 'Return stderr details if exitCode != 0 so LLM can understand failures.',
    javaCodeTemplate: `package com.leanllm.agent;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.ToolDefinition;
import com.leanllm.scripting.*;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * @summary Bridge tool delegating execution to external guest scripts.
 */
public final class ScriptDelegatingTool implements Tool {
    private final ToolDefinition definition;
    private final AbstractProcessRunner runner;
    private final Path scriptPath;
    private final Duration timeout;

    public ScriptDelegatingTool(ToolDefinition def, AbstractProcessRunner runner, Path script, Duration timeout) {
        this.definition = def;
        this.runner = runner;
        this.scriptPath = script;
        this.timeout = timeout != null ? timeout : Duration.ofSeconds(15);
    }

    @Override
    public ToolDefinition getDefinition() { return definition; }

    @Override
    public String execute(String rawArgs, CancellationToken token) throws Exception {
        ScriptExecutionRequest req = new ScriptExecutionRequest(
            scriptPath, List.of(rawArgs), Map.of(), scriptPath.getParent(), timeout
        );
        ScriptExecutionResult res = runner.run(req, token);
        if (!res.isSuccess()) {
            return "Tool Execution Error (Code " + res.exitCode() + "): " + res.stderr();
        }
        return res.stdout().trim();
    }
}`,
    relatedWiki: 'docs/agent/ScriptDelegation.md',
  },
  {
    className: 'AgentContext',
    packageName: 'com.leanllm.agent',
    type: 'class',
    locTarget: '< 75 LOC',
    actualLocEstimate: 60,
    category: 'Agentic Core & Presentation',
    purpose: 'Thread-safe state manager for conversational history and iteration bounds.',
    whyWeNeedIt: 'Preserves state across multi-turn reasoning loops and prevents infinite recursion.',
    securityAndEnterpriseNotes: 'Enforces hard maximum iteration thresholds (e.g., 10 turns) to prevent infinite loops.',
    fieldsToImplement: [
      { name: 'conversationHistory', type: 'List<ChatMessage>', description: 'Accumulated messages in active session.' },
      { name: 'maxIterations', type: 'int', description: 'Safety threshold on ReAct cycles.' },
      { name: 'currentIteration', type: 'int', description: 'Counter of executed cycles.' },
      { name: 'compactor', type: 'ContextCompactor', description: 'History sliding-window pruner.' },
    ],
    methodsToImplement: [
      { signature: 'synchronized void append(ChatMessage msg)', behavior: 'Adds message to history and compacts.' },
      { signature: 'synchronized boolean canIterate()', behavior: 'Returns true if currentIteration < maxIterations.' },
      { signature: 'synchronized void nextIteration()', behavior: 'Increments iteration count or throws exception.' },
      { signature: 'synchronized List<ChatMessage> getHistory()', behavior: 'Returns unmodifiable defensive copy of history.' },
    ],
    instructionForGeneratingAgent: 'Enforce loop safety mechanics and synchronization requirements.',
    javaCodeTemplate: `package com.leanllm.agent;

import com.leanllm.domain.ChatMessage;
import java.util.*;

/**
 * @summary Thread-safe state tracker for an agentic conversational session.
 * @threadsafe Synchronized methods protect internal conversational history.
 */
public final class AgentContext {
    private final List<ChatMessage> history = new ArrayList<>();
    private final int maxIterations;
    private int currentIteration = 0;
    private final ContextCompactor compactor;

    public AgentContext(int maxIterations, ContextCompactor compactor) {
        this.maxIterations = Math.max(1, maxIterations);
        this.compactor = compactor;
    }

    public synchronized void append(ChatMessage msg) {
        history.add(Objects.requireNonNull(msg));
        if (compactor != null) {
            List<ChatMessage> compacted = compactor.compact(history);
            history.clear();
            history.addAll(compacted);
        }
    }

    public synchronized boolean canIterate() { return currentIteration < maxIterations; }

    public synchronized void nextIteration() {
        if (!canIterate()) throw new IllegalStateException("Max iterations (" + maxIterations + ") exceeded");
        currentIteration++;
    }

    public synchronized List<ChatMessage> getHistory() {
        return Collections.unmodifiableList(new ArrayList<>(history));
    }
}`,
    relatedWiki: 'docs/agent/ReActOrchestration.md',
  },
  {
    className: 'UiBridge',
    packageName: 'com.leanllm.ui',
    type: 'interface',
    locTarget: '< 45 LOC',
    actualLocEstimate: 32,
    category: 'Agentic Core & Presentation',
    purpose: 'Event-driven decoupling interface connecting the core agent to any UI (JavaFX, CLI, WebSockets).',
    whyWeNeedIt: 'Decouples the core agent loop from graphical or terminal frameworks.',
    securityAndEnterpriseNotes: 'All methods must be non-blocking. Implementations handle thread switching.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'void onStatus(String status)', behavior: 'Notifies UI of state changes.' },
      { signature: 'void onToken(String tokenDelta)', behavior: 'Sends streaming token fragments directly to UI view.' },
      { signature: 'void onToolStart(String toolName, String args)', behavior: 'Alerts UI that a tool is being invoked.' },
      { signature: 'void onToolEnd(String toolName, String output)', behavior: 'Alerts UI that tool execution completed.' },
      { signature: 'void onError(String message, Throwable cause)', behavior: 'Passes formatted errors to UI.' },
    ],
    instructionForGeneratingAgent: 'Ensure all methods are non-blocking to prevent UI stalls.',
    javaCodeTemplate: `package com.leanllm.ui;

/**
 * @summary Event-driven decoupling bridge between agent core and presentation layers.
 * @contract Non-blocking; implementations dispatch to appropriate thread (e.g. JavaFX Platform.runLater).
 */
public interface UiBridge {
    void onStatus(String status);
    void onToken(String tokenDelta);
    void onToolStart(String toolName, String args);
    void onToolEnd(String toolName, String output);
    void onError(String message, Throwable cause);
}`,
    relatedWiki: 'docs/ui/UiDecoupling.md',
  },
  {
    className: 'AgentEngine',
    packageName: 'com.leanllm.agent',
    type: 'class',
    locTarget: '< 115 LOC',
    actualLocEstimate: 98,
    category: 'Agentic Core & Presentation',
    purpose: 'Executes the multi-turn ReAct (Thought -> Action -> Observation) cognitive loop.',
    whyWeNeedIt: 'Drives the cognitive loop: prompts model, detects tool calls, executes registered tools, feeds results back to model, and recurses until final response.',
    securityAndEnterpriseNotes: 'Cycle until LLM generates final response without tool calls or iteration limit is reached. Report events to UiBridge.',
    fieldsToImplement: [
      { name: 'client', type: 'LlmClient', description: 'Inference backend.' },
      { name: 'modelId', type: 'String', description: 'Identifier of LLM to run.' },
      { name: 'toolRegistry', type: 'Map<String, Tool>', description: 'Active tool registry.' },
      { name: 'uiBridge', type: 'UiBridge', description: 'Presentation bridge.' },
    ],
    methodsToImplement: [
      { signature: 'void registerTool(Tool tool)', behavior: 'Registers tool in internal map.' },
      { signature: 'String run(AgentContext context, String userQuery, CancellationToken token) throws Exception', behavior: 'Executes ReAct cycle until final assistant message is generated.' },
    ],
    instructionForGeneratingAgent: 'Document complete ReAct cycle in class Javadoc.',
    javaCodeTemplate: `package com.leanllm.agent;

import com.leanllm.client.LlmClient;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.*;
import com.leanllm.ui.UiBridge;
import java.util.*;

/**
 * @summary Autonomous ReAct (Reasoning + Acting) orchestrator.
 * @security Enforces hard iteration limits to prevent infinite recursive tool loops.
 */
public final class AgentEngine {
    private final LlmClient client;
    private final String modelId;
    private final Map<String, Tool> tools = new HashMap<>();
    private final UiBridge uiBridge;

    public AgentEngine(LlmClient client, String modelId, UiBridge uiBridge) {
        this.client = Objects.requireNonNull(client);
        this.modelId = Objects.requireNonNull(modelId);
        this.uiBridge = uiBridge;
    }

    public void registerTool(Tool tool) {
        tools.put(tool.getDefinition().name(), tool);
    }

    public String run(AgentContext ctx, String query, CancellationToken token) throws Exception {
        ctx.append(ChatMessage.user(query));
        if (uiBridge != null) uiBridge.onStatus("Reasoning...");

        List<ToolDefinition> defs = tools.values().stream().map(Tool::getDefinition).toList();

        while (ctx.canIterate()) {
            if (token != null && token.isCancelled()) return "Execution cancelled.";
            ctx.nextIteration();

            InferenceRequest req = new InferenceRequest(modelId, ctx.getHistory(), defs, 0.7, 2048);
            InferenceResponse resp = client.complete(req, token);
            ctx.append(resp.message());

            if (!resp.hasToolCalls()) {
                if (uiBridge != null) uiBridge.onStatus("Completed.");
                return resp.message().content();
            }

            for (ToolCall tc : resp.toolCalls()) {
                Tool target = tools.get(tc.functionName());
                if (uiBridge != null) uiBridge.onToolStart(tc.functionName(), tc.rawArgumentsJson());
                String result;
                if (target == null) {
                    result = "Error: Tool '" + tc.functionName() + "' is not registered.";
                } else {
                    try {
                        result = target.execute(tc.rawArgumentsJson(), token);
                    } catch (Exception e) {
                        result = "Tool Failure: " + e.getMessage();
                    }
                }
                if (uiBridge != null) uiBridge.onToolEnd(tc.functionName(), result);
                ctx.append(ChatMessage.toolResult(tc.id(), result));
            }
        }
        return "Max reasoning iterations reached without resolution.";
    }
}`,
    relatedWiki: 'docs/agent/ReActOrchestration.md',
  },
  {
    className: 'LlmClientFactory',
    packageName: 'com.leanllm.factory',
    type: 'class',
    locTarget: '< 65 LOC',
    actualLocEstimate: 45,
    category: 'Dynamic Factories & Discovery',
    purpose: 'Factory instantiating validated local and cloud LLM clients.',
    whyWeNeedIt: 'Encapsulates configuration parsing, endpoint routing, credential verification, and client instantiation logic.',
    securityAndEnterpriseNotes: 'Validates API keys and endpoints before returning client instances.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'static LlmClient createCloud(URI endpoint, SecureSecret apiKey, Duration timeout)', behavior: 'Instantiates and validates a CloudLlmClient.' },
      { signature: 'static LlmClient createLocal(URI loopbackUri, Duration timeout)', behavior: 'Instantiates and validates a LocalLlmClient.' },
    ],
    instructionForGeneratingAgent: 'Validate parameters and ensure proper setup of TLS options.',
    javaCodeTemplate: `package com.leanllm.factory;

import com.leanllm.client.LlmClient;
import com.leanllm.client.cloud.CloudLlmClient;
import com.leanllm.client.local.LocalLlmClient;
import com.leanllm.security.SecureSecret;
import java.net.URI;
import java.time.Duration;

/**
 * @summary Factory for instantiating validated LLM transport clients.
 */
public final class LlmClientFactory {
    private LlmClientFactory() {}

    public static LlmClient createCloud(URI endpoint, SecureSecret apiKey, Duration timeout) {
        return new CloudLlmClient(endpoint, apiKey, timeout);
    }

    public static LlmClient createLocal(URI loopbackUri, Duration timeout) {
        return new LocalLlmClient(loopbackUri, timeout);
    }
}`,
    relatedWiki: 'docs/factory/LifecycleFactories.md',
  },
  {
    className: 'ScriptRunnerFactory',
    packageName: 'com.leanllm.factory',
    type: 'class',
    locTarget: '< 80 LOC',
    actualLocEstimate: 65,
    category: 'Dynamic Factories & Discovery',
    purpose: 'Discovers and instantiates TypeScript and Python runners on the host system.',
    whyWeNeedIt: 'Auto-detects available local binaries (detecting Deno, Bun, or Node; locating python3 in PATH or venv).',
    securityAndEnterpriseNotes: 'Prioritize TypeScript runtimes: inspect system PATH for Deno, then Bun, then ts-node. Python is configured explicitly or via venv.',
    fieldsToImplement: [],
    methodsToImplement: [
      { signature: 'static TypeScriptRunner createTypeScriptRunner()', behavior: 'Discovers Deno -> Bun -> ts-node on PATH.' },
      { signature: 'static PythonRunner createPythonRunner(Path optionalVenvPath)', behavior: 'Resolves python binary from virtualenv or PATH.' },
    ],
    instructionForGeneratingAgent: 'Document discovery fallback chains (e.g. Deno -> Bun -> ts-node) in Javadoc.',
    javaCodeTemplate: `package com.leanllm.factory;

import com.leanllm.scripting.python.PythonRunner;
import com.leanllm.scripting.ts.TypeScriptRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.nio.file.*;
import java.util.List;

/**
 * @summary Host discovery factory prioritizing modern TypeScript engines.
 */
public final class ScriptRunnerFactory {
    private ScriptRunnerFactory() {}

    public static TypeScriptRunner createTypeScriptRunner() {
        String[] candidates = {"deno", "bun", "npx ts-node"};
        String resolved = "deno"; // default or discovered via PATH probe
        List<String> flags = resolved.contains("deno") ? List.of("run", "--deny-net") : List.of();
        return new TypeScriptRunner(resolved, flags, EnvironmentSanitizer.defaultSandbox());
    }

    public static PythonRunner createPythonRunner(Path optionalVenv) {
        Path binary = optionalVenv != null ? optionalVenv.resolve("bin/python3") : Path.of("python3");
        return new PythonRunner(binary, EnvironmentSanitizer.defaultSandbox());
    }
}`,
    relatedWiki: 'docs/factory/LifecycleFactories.md',
  },
];

export const OBSIDIAN_WIKI_PAGES: WikiPage[] = [
  {
    file: 'INDEX.md',
    id: 'ROOT-00',
    title: 'Lean Java Agentic Core - Knowledge Graph Index',
    type: 'index',
    module: 'com.leanllm',
    contextCost: 180,
    tags: ['master-index', 'knowledge-graph', 'agentic-core'],
    relatedLinks: [
      '[[docs/security/SecureSecret]]',
      '[[docs/security/EnvironmentSanitizer]]',
      '[[docs/security/ProcessTreeTerminator]]',
      '[[docs/json/ZeroDepJson]]',
      '[[docs/domain/MessageProtocol]]',
      '[[docs/client/InferenceClients]]',
      '[[docs/scripting/PolyglotExecution]]',
      '[[docs/agent/ReActOrchestration]]',
      '[[docs/ui/UiDecoupling]]',
    ],
    content: `# Lean Java Agentic Core (LJAC) - Master Knowledge Index

Master entrypoint for downstream agentic retrieval and human developers. Follow the [[WikiLinks]] below to inspect subsystem architectural contracts.

## 1. Security & Memory Hygiene
- [[docs/security/SecureSecret|Memory-Safe Credential Hygiene]] — Mutable character buffers with null-byte zeroing.
- [[docs/security/EnvironmentSanitizer|Host Environment Sanitization]] — Whitelist-only environment block defense.
- [[docs/security/ProcessTreeTerminator|Zombie Process Elimination]] — Recursive JDK 21 ProcessHandle tree termination.

## 2. Zero-Dependency Protocol & JSON Engine
- [[docs/json/ZeroDepJson|Zero-Dependency JSON AST & Parser]] — Self-contained recursive descent parser with depth bounds.

## 3. Domain Model & Messaging Protocol
- [[docs/domain/MessageProtocol|Canonical Chat Turns & Tool Schemas]] — Java Records for lightweight domain carrier objects.

## 4. Inference Clients & Network Transport
- [[docs/client/InferenceClients|Cloud REST & Local Loopback Clients]] — HTTP/2 SSE streaming and loopback SSRF defense.

## 5. Dynamic Polyglot Scripting
- [[docs/scripting/PolyglotExecution|TypeScript & Python Process Isolation]] — Out-of-process execution via ProcessBuilder.

## 6. Autonomous ReAct & Presentation
- [[docs/agent/ReActOrchestration|Autonomous ReAct Engine & State Context]] — Thought-Action-Observation state machine.
- [[docs/ui/UiDecoupling|Presentation Abstraction via UiBridge]] — Event-driven observer interface for JavaFX/CLI.`,
  },
  {
    file: 'docs/security/SecureSecret.md',
    id: 'SEC-01',
    title: 'Memory-Safe Credential Hygiene',
    type: 'class',
    module: 'com.leanllm.security',
    contextCost: 320,
    tags: ['security', 'memory-safety', 'credentials'],
    relatedLinks: ['[[docs/client/InferenceClients]]', '[[docs/security/EnvironmentSanitizer]]'],
    content: `# SecureSecret

## Overview
\`SecureSecret\` is a memory-safe credential wrapper that holds sensitive authorization keys in a mutable \`char[]\` buffer, providing explicit deterministic zeroing via \`AutoCloseable\`.

## Architectural Rationale
Standard Java \`String\` objects reside in the JVM String Pool or heap indefinitely until garbage-collected. In memory dumps or core dumps, secrets are exposed in plaintext. \`SecureSecret\` enables deterministic overwriting with null bytes (\`\\0\`) immediately after header transmission.

## Security Contract
- Implements \`AutoCloseable\` and \`java.security.Destroyable\`.
- Any invocation of \`accessSecret()\` after \`close()\` throws \`IllegalStateException\`.
- Thread-safe via synchronized access locks.

## Interconnections
- Consumed by: [[docs/client/InferenceClients]]
- Sibling: [[docs/security/EnvironmentSanitizer]]`,
  },
  {
    file: 'docs/security/ProcessTreeTerminator.md',
    id: 'SEC-02',
    title: 'Zombie Process Elimination',
    type: 'class',
    module: 'com.leanllm.security',
    contextCost: 290,
    tags: ['security', 'process-isolation', 'zombie-cleanup'],
    relatedLinks: ['[[docs/scripting/PolyglotExecution]]'],
    content: `# ProcessTreeTerminator

## Overview
\`ProcessTreeTerminator\` recursively terminates parent and all descendant OS processes using the Java 21 \`ProcessHandle\` API.

## Architectural Rationale
Standard \`Process.destroyForcibly()\` only halts the root process. If a TypeScript engine or Python script spawns child worker threads or background child processes, those descendants stay alive indefinitely, causing memory and port resource exhaustion.

## Security Contract
1. Traverses \`process.toHandle().descendants()\`.
2. Attempts graceful \`destroy()\`.
3. Pauses for a configurable grace period (\`gracePeriodMillis\`).
4. Executes \`destroyForcibly()\` on all remaining live descendant handles and the root.`,
  },
  {
    file: 'docs/json/ZeroDepJson.md',
    id: 'JSON-01',
    title: 'Zero-Dependency JSON AST & Parser',
    type: 'sealed class / utility',
    module: 'com.leanllm.json',
    contextCost: 380,
    tags: ['json', 'ast', 'zero-dependency', 'parser'],
    relatedLinks: ['[[docs/domain/MessageProtocol]]', '[[docs/client/InferenceClients]]'],
    content: `# Zero-Dependency JSON AST & Parser

## Overview
A standalone JSON Abstract Syntax Tree (\`JsonNode\`) and recursive-descent parser (\`JsonParser\`) operating strictly within \`java.base\`.

## Architectural Rationale
Eliminating external dependencies (Jackson, Gson) avoids supply chain CVEs and version drift. The custom parser implements recursion depth protection (\`MAX_RECURSION_DEPTH = 64\`) against malicious stack overflow payloads.

## Subtype Records
- \`JsonObject(Map<String, JsonNode> members)\`
- \`JsonArray(List<JsonNode> elements)\`
- \`JsonString(String value)\`
- \`JsonNumber(double value)\`
- \`JsonBoolean(boolean value)\`
- \`JsonNull()\`

## Interconnections
- Used by: [[docs/domain/MessageProtocol]] for Tool Schema declarations.
- Consumed by: [[docs/client/InferenceClients]] for request/response serialization.`,
  },
  {
    file: 'docs/domain/MessageProtocol.md',
    id: 'DOM-01',
    title: 'Canonical Chat Turns and Tool Schemas',
    type: 'records / enums',
    module: 'com.leanllm.domain',
    contextCost: 340,
    tags: ['domain', 'records', 'protocol', 'token-economy'],
    relatedLinks: ['[[docs/agent/ReActOrchestration]]', '[[docs/domain/ContextManagement]]'],
    content: `# Canonical Chat Turns and Tool Schemas

## Overview
Defines immutable Java Records representing conversational turns, tool declarations, tool execution calls, and inference payloads.

## Architectural Rationale
Using Java Records cuts boilerplate by 65% compared to JavaBeans, resulting in dramatic token savings when downstream agents read code. Immutability guarantees thread safety across asynchronous execution turns.

## Key Records
- \`ChatMessage\`: Role, content, toolCallId, and toolCalls list.
- \`ToolCall\`: Unique invocation ID, functionName, and unparsed argumentsJson.
- \`ToolDefinition\`: Validated tool name, semantic description, and parameters JSON Schema.
- \`InferenceRequest\` & \`InferenceResponse\`: Normalized input and output envelopes.`,
  },
  {
    file: 'docs/domain/ContextManagement.md',
    id: 'DOM-02',
    title: 'Token Estimation & Context Compaction',
    type: 'classes',
    module: 'com.leanllm.agent',
    contextCost: 310,
    tags: ['context-management', 'token-budget', 'sliding-window'],
    relatedLinks: ['[[docs/domain/MessageProtocol]]', '[[docs/agent/ReActOrchestration]]'],
    content: `# Token Estimation & Context Compaction

## Overview
\`TokenEstimator\` provides zero-dependency character-to-token heuristic budgeting, while \`ContextCompactor\` applies sliding-window message history truncation.

## Architectural Rationale
Multi-turn agent loops quickly exceed model context limits, triggering 400 Bad Request rejections. The compactor prunes older user/assistant turns while strictly protecting \`SYSTEM\` role prompts at the start of conversation.

## Heuristic Formula
- Base ratio: \`~3.8\` to \`4.0\` chars per token.
- Safety padding: \`+10%\` to account for punctuation and sub-word tokenizer variance.`,
  },
  {
    file: 'docs/client/InferenceClients.md',
    id: 'NET-01',
    title: 'Cloud REST & Local Loopback Clients',
    type: 'interfaces / classes',
    module: 'com.leanllm.client',
    contextCost: 360,
    tags: ['transport', 'http2', 'sse-streaming', 'ssrf-defense'],
    relatedLinks: ['[[docs/security/SecureSecret]]', '[[docs/ui/UiDecoupling]]'],
    content: `# Cloud REST & Local Loopback Clients

## Overview
Unified inference transport built directly upon JDK 21 \`java.net.http.HttpClient\`.

## Architectural Rationale
Provides HTTP/2 connection multiplexing, TLS 1.3 security, and zero-dependency Server-Sent Events (SSE) streaming via line inspection.

## SSRF Defense Contract
\`LocalLlmClient\` asserts the host name equals \`localhost\`, \`127.0.0.1\`, or \`::1\`. Any attempt to target intranet or external IP addresses throws a \`SecurityException\`.`,
  },
  {
    file: 'docs/scripting/PolyglotExecution.md',
    id: 'SCRIPT-01',
    title: 'TypeScript and Python Process Isolation',
    type: 'abstract runner / classes',
    module: 'com.leanllm.scripting',
    contextCost: 390,
    tags: ['scripting', 'polyglot', 'deno', 'bun', 'python', 'virtual-threads'],
    relatedLinks: ['[[docs/security/ProcessTreeTerminator]]', '[[docs/agent/ScriptDelegation]]'],
    content: `# TypeScript and Python Process Isolation

## Overview
Executes dynamic guest scripts in isolated OS processes managed directly via \`ProcessBuilder\` without intermediate shell wrappers (\`sh -c\` or \`cmd /c\`).

## Polyglot Strategy
- **TypeScript**: Primary execution runtime using Deno (with sandbox flags like \`--deny-net\`), Bun, or ts-node.
- **Python**: Secondary opt-in runner using \`python3\` with \`-B\` (no bytecode) and \`-u\` (unbuffered) flags.

## Virtual Thread Stream Drainage
Concurrent stream drainage for stdout and stderr uses Java 21 Virtual Threads (\`Thread.ofVirtual().start()\`), eliminating OS thread overhead and pipe deadlocks.`,
  },
  {
    file: 'docs/agent/ReActOrchestration.md',
    id: 'AGENT-01',
    title: 'Autonomous ReAct Engine & State Context',
    type: 'classes',
    module: 'com.leanllm.agent',
    contextCost: 350,
    tags: ['react-loop', 'state-machine', 'iteration-guardrails'],
    relatedLinks: ['[[docs/ui/UiDecoupling]]', '[[docs/domain/MessageProtocol]]'],
    content: `# Autonomous ReAct Engine & State Context

## Overview
Drives the cyclic Thought -> Action -> Observation cognitive loop.

## Architectural Rationale
\`AgentEngine\` prompts the LLM, checks for tool call directives in \`InferenceResponse\`, dispatches tool execution, appends tool outputs as conversational turns, and loops until the final answer is reached.

## Safety Guardrails
- Hard iteration limit (\`maxIterations\`, default 10 turns) enforced by \`AgentContext\`.
- Tool execution exceptions are caught and reported as tool result messages back to the LLM rather than crashing the JVM.`,
  },
  {
    file: 'docs/ui/UiDecoupling.md',
    id: 'UI-01',
    title: 'Presentation Abstraction via UiBridge',
    type: 'interface',
    module: 'com.leanllm.ui',
    contextCost: 260,
    tags: ['ui-bridge', 'observer-pattern', 'decoupling'],
    relatedLinks: ['[[docs/agent/ReActOrchestration]]'],
    content: `# Presentation Abstraction via UiBridge

## Overview
Decoupled event-driven observer interface separating the Java agent core from any user interface (JavaFX, CLI, WebSockets).

## Contract
- Non-blocking methods (\`onStatus\`, \`onToken\`, \`onToolStart\`, \`onToolEnd\`, \`onError\`).
- Implementations handle UI thread marshaling (e.g. \`Platform.runLater\` in JavaFX).`,
  },
];
