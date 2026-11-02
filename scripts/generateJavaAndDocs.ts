import fs from 'fs';
import path from 'path';
import { POJO_INVENTORY, OBSIDIAN_WIKI_PAGES, MASTER_METADATA } from '../src/data/projectData';

const ROOT_DIR = process.cwd();

// 1. Generate Obsidian Wiki documentation
console.log('Generating Obsidian Wiki documentation...');
for (const page of OBSIDIAN_WIKI_PAGES) {
  const filePath = path.join(ROOT_DIR, page.file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const frontmatter = `---
id: ${page.id}
title: "${page.title}"
type: ${page.type}
module: ${page.module}
context_cost: ${page.contextCost}
tags: [${page.tags.join(', ')}]
related_links:
${page.relatedLinks.map((l) => `  - "${l}"`).join('\n')}
---

`;

  fs.writeFileSync(filePath, frontmatter + page.content, 'utf-8');
  console.log(`Created: ${page.file}`);
}

// 2. Generate Java 21 POJO source code
console.log('\nGenerating Java 21 POJO source files...');
const JAVA_SRC_ROOT = path.join(ROOT_DIR, 'java', 'src', 'main', 'java');

for (const pojo of POJO_INVENTORY) {
  const packagePath = pojo.packageName.replace(/\./g, '/');
  const targetDir = path.join(JAVA_SRC_ROOT, packagePath);
  fs.mkdirSync(targetDir, { recursive: true });

  const fileName = `${pojo.className}.java`;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, pojo.javaCodeTemplate + '\n', 'utf-8');
  console.log(`Created: java/src/main/java/${packagePath}/${fileName}`);
}

// 3. Generate README.md
console.log('\nGenerating root README.md...');
const readmeContent = `# ${MASTER_METADATA.projectName}

> **${MASTER_METADATA.targetJdk}** · **${MASTER_METADATA.dependencyPolicy}**

${MASTER_METADATA.vision}

---

## 🏛️ Polyglot Architecture

- **Java 21 LTS Orchestration Core**: Zero external runtime dependencies (\`java.base\` module only). Manages ReAct cycles, thread-safe context compaction, HTTP/2 Server-Sent Events (SSE) streaming, credential scrubbing, and process supervision.
- **TypeScript (Deno / Bun / ts-node)**: Primary guest scripting language for all dynamic agent tools, API adapters, and JSON data transformations.
- **Python 3**: Auxiliary guest scripting language strictly for numerical mathematics, scientific computing, and ML inference.
- **Subprocess Isolation**: Out-of-process execution managed directly via \`ProcessBuilder\` without intermediate shell wrappers (\`no sh -c\` or \`cmd /c\`).

---

## 🔒 5 Critical Remediated Architectural Gaps

1. **Zombie Subprocess Elimination (\`ProcessTreeTerminator\`)**: Uses JDK 21 \`ProcessHandle.descendants()\` to recursively kill process trees, eliminating orphan child processes upon timeout or cancellation.
2. **Context Window Overflow Defense (\`TokenEstimator\` & \`ContextCompactor\`)**: Heuristic character-to-token budgeting (~3.8 chars/token) with sliding-window compaction that preserves \`SYSTEM\` instructions at index 0.
3. **Cooperative Cancellation (\`CancellationToken\`)**: Thread-safe \`AtomicBoolean\` signaling primitive for halting inference streams and script execution.
4. **Ephemeral Script Lifecycle (\`EphemeralScriptManager\`)**: \`AutoCloseable\` temporary script manager guaranteeing disk cleanup upon context exit.
5. **Zero OS Thread Overhead (\`AbstractProcessRunner\`)**: Uses Java 21 Virtual Threads (\`Thread.ofVirtual().start()\`) for non-blocking stream drainage without pipe deadlocks.

---

## 📦 Codebase Structure

\`\`\`
├── docs/                                 # Obsidian-flavored Markdown Documentation Graph
│   ├── security/                         # Memory hygiene, environment sanitization, tree termination
│   ├── json/                             # Zero-dependency JSON AST & recursive-descent parser
│   ├── domain/                           # Canonical turns, tool schemas, token estimation
│   ├── client/                           # HTTP/2 SSE transport, Cloud & Local SSRF loopback clients
│   ├── scripting/                        # Polyglot Deno/Bun & Python process isolation
│   ├── agent/                            # ReAct cognitive engine & script-delegating tools
│   └── ui/                               # Decoupled UiBridge observer interface
├── INDEX.md                              # Master knowledge graph index
├── java/                                 # Zero-Dependency Java 21 Source Code
│   └── src/main/java/com/leanllm/        # 26 atomic POJOs, Records & Interfaces (<120 LOC each)
└── src/                                  # Interactive Executive Architecture & Roadmap Platform (React + Express)
\`\`\`

---

## 💻 Building the Java Core

Standard OpenJDK 21 LTS:

\`\`\`bash
cd java
javac -d bin --release 21 -Xlint:all src/main/java/com/leanllm/*/*.java
\`\`\`

---

## 🚀 Running the Architecture & Roadmap Platform

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit \`http://localhost:3000\` to explore:
- The 5-Phase Master Implementation Roadmap & Downstream Agent Tasks
- 8 Subsystem Technical Architecture Deep-Dive
- 26-POJO Code Inspector with Javadoc and code copy
- Interactive Obsidian Knowledge Graph with clickable [[WikiLinks]]
- Live Simulators (ReAct cognitive loop, SecureSecret memory wipe, ContextCompactor, EnvironmentSanitizer)
- AI Architectural Consultant (Search Grounding via \`gemini-3.8-flash\` & High Thinking via \`gemini-4-argon\`)
`;

fs.writeFileSync(path.join(ROOT_DIR, 'README.md'), readmeContent, 'utf-8');
console.log('Created: README.md');
console.log('\nAll artifacts generated successfully!');
