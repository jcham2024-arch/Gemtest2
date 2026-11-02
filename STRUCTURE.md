# Supplements — Package & Module Structure

Loaded from P1 onward and stays loaded for every subsequent phase.

---

## 1. Maven Module Tree

```
apex/
├── pom.xml                          # Parent aggregator (packaging=pom)
├── apex-chat/                       # Layer 1 pure POJOs
│   ├── pom.xml                      # packaging=pom
│   └── apex-chat-common/            # TenantId, SessionId, CommitId, BlobId
├── apex-core/                       # Layer 2 core interfaces & implementations
│   ├── pom.xml                      # packaging=pom
│   ├── engine-core/                 # 9 port interfaces, domain records, RiskLevel
│   ├── engine-planner/              # AStarPlanner, PlanLoop, Action, Goal, Condition
│   ├── engine-store/                # StoragePort interface
│   └── engine-tools/                # Tool interfaces and contracts
├── apex-platform/                   # Layer 2 security, multi-tenancy, audit (Tier 2)
│   ├── pom.xml                      # packaging=pom
│   ├── apex-auth/                   # JWT & PermissionGrant verification
│   ├── apex-tenant/                 # Row-Level Security (RLS)
│   └── apex-audit/                  # Chained audit log
├── engine-cli/                      # CLI task runner, YAML task schema
├── engine-llm-http/                 # OpenAI-compatible HTTP streaming provider
├── engine-store-sqlite/             # SQLite step_log with WAL mode & session queries
├── engine-tools-impl/               # RealPathJail, ProcessTreeTerminator, 5 kernel tools
├── java/                            # LeanJavallm salvage reference implementations
└── client/                          # Tauri 2.0 + React 19 isomorphic client
```

---

## 2. Java Package Map

```
com.apex
├── chat.common                      # TenantId, SessionId, CommitId, BlobId
├── engine.core
│   ├── port                         # 9 core ports (ChatModelPort, PlannerPort, etc.)
│   │   └── model                    # ApprovalRequest, RiskLevel, StepLog, ToolDef
│   └── context                      # ExecutionContext, ContextResolver
├── engine.planner                   # AStarPlanner, PlanLoop, Action, Goal, Condition
├── engine.store                     # StoragePort interface
├── engine.store.sqlite              # SqliteStoragePort (WAL, single-writer)
├── engine.llm.http                  # OpenAiCompatibleProvider, StreamSubscriber
├── engine.tools                     # Tool interfaces, ToolDescriptor
├── engine.tools.impl                # RealPathJail, ProcessTreeTerminator, 5 kernel tools
├── platform.auth                    # TokenValidator, PermissionGrant
├── platform.tenant                  # TenantContext, RlsFilter
└── platform.audit                   # ChainedAuditLogger, Sha256Digest

com.leanllm                          # Reference salvage packages (LeanJavallm)
├── agent                            # AgentEngine, AgentContext, Tool
├── security                         # ProcessTreeTerminator, SecureSecret, EnvironmentSanitizer
├── concurrency                      # CancellationToken
├── domain                           # ContextCompactor, TokenEstimator
└── json                             # JsonParser, JsonNode
```

---

## 3. Test Mirror Rule

- `src/test/java/...` mirrors `src/main/java/...` exactly.
- Property tests live in the same package as the class under test.
- Integration tests (`*IT.java`) live in the same package, tagged `@Tag("integration")`, and excluded from default surefire runs.

---

## 4. Rule of Adherence

If you need a package that is not in this tree, **stop and report**. Do not invent packages silently — a new package is an architectural decision that affects imports across modules.
