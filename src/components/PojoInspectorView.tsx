import React, { useState } from 'react';
import { POJO_INVENTORY } from '../data/projectData';
import { PojoSpecification } from '../types/architecture';
import {
  Search,
  Copy,
  Check,
  Code2,
  Lock,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

interface PojoInspectorViewProps {
  initialSelectedPojo?: string;
  onOpenAiResearch: (query?: string, codeContext?: string) => void;
}

export const PojoInspectorView: React.FC<PojoInspectorViewProps> = ({
  initialSelectedPojo,
  onOpenAiResearch,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const [selectedPojoName, setSelectedPojoName] = useState<string>(
    initialSelectedPojo || 'SecureSecret'
  );

  const categories = [
    'all',
    'Security & Memory Hygiene',
    'Concurrency & Control',
    'Zero-Dependency JSON AST',
    'Domain & Messaging',
    'Domain & Context Management',
    'Transport & Inference Clients',
    'Polyglot Guest Scripting',
    'Agentic Core & Presentation',
    'Dynamic Factories & Discovery',
  ];

  const types = ['all', 'class', 'record', 'interface', 'abstract class', 'enum'];

  const filteredPojos = POJO_INVENTORY.filter((pojo) => {
    const matchesSearch =
      pojo.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pojo.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pojo.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || pojo.category === selectedCategory;
    const matchesType = selectedType === 'all' || pojo.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const activePojo: PojoSpecification =
    POJO_INVENTORY.find((p) => p.className === selectedPojoName) ||
    filteredPojos[0] ||
    POJO_INVENTORY[0];

  const handleCopyCode = () => {
    if (activePojo?.javaCodeTemplate) {
      navigator.clipboard.writeText(activePojo.javaCodeTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportScaffold = () => {
    const manifest = POJO_INVENTORY.map((p) => ({
      className: p.className,
      package: p.packageName,
      type: p.type,
      locTarget: p.locTarget,
      path: `src/main/java/${p.packageName.replace(/\\./g, '/')}/${p.className}.java`,
    }));
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ljac-scaffold-manifest.json';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            Component Inventory
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            26 Micro-POJO Specifications & Source Code
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            All classes strictly respect the <span className="text-slate-200 font-semibold">&lt; 120 LOC constraint</span>, utilize Java Records for data carriers, and employ standardized Javadoc tags (<code className="text-indigo-300 font-mono">@summary</code>, <code className="text-indigo-300 font-mono">@threadsafe</code>, <code className="text-indigo-300 font-mono">@security</code>, <code className="text-indigo-300 font-mono">@contract</code>).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportScaffold}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by class name, package, or responsibility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Subsystem Category"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Subsystems' : c}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Java Structure Type"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Types' : t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800/60">
          <span>Showing {filteredPojos.length} of {POJO_INVENTORY.length} components</span>
          <span>Zero third-party runtime dependencies</span>
        </div>
      </div>

      {/* Master Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: POJO List */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredPojos.map((pojo) => {
            const isSelected = pojo.className === activePojo?.className;
            return (
              <button
                key={pojo.className}
                onClick={() => setSelectedPojoName(pojo.className)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-indigo-300 font-semibold">{pojo.className}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{pojo.type}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{pojo.packageName}</div>
                <div className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{pojo.purpose}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>{pojo.category}</span>
                  <span className="font-mono tabular-nums text-slate-400">{pojo.locTarget}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active POJO Deep-Dive */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {activePojo ? (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
                    <span>{activePojo.packageName}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="uppercase">{activePojo.type}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-emerald-400">{activePojo.locTarget}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono">{activePojo.className}</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activePojo.purpose}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Java 21 Code'}</span>
                  </button>
                  <button
                    onClick={() =>
                      onOpenAiResearch(
                        `Explain implementation invariants and edge cases for ${activePojo.className}`,
                        activePojo.javaCodeTemplate
                      )
                    }
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Review</span>
                  </button>
                </div>
              </div>

              {/* Rationale & Security Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Why We Need It</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activePojo.whyWeNeedIt}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Security & Invariants</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activePojo.securityAndEnterpriseNotes}</p>
                </div>
              </div>

              {/* Fields Table */}
              {activePojo.fieldsToImplement.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Fields & State
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Field Name</th>
                          <th className="py-2 px-3 font-semibold font-mono">Type</th>
                          <th className="py-2 px-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {activePojo.fieldsToImplement.map((f, fIdx) => (
                          <tr key={fIdx} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-mono text-indigo-300 font-medium">{f.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{f.type}</td>
                            <td className="py-2 px-3 text-slate-400">{f.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Methods Table */}
              {activePojo.methodsToImplement.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Method Contracts
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="py-2 px-3 font-semibold font-mono">Method Signature</th>
                          <th className="py-2 px-3 font-semibold">Behavioral Contract</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {activePojo.methodsToImplement.map((m, mIdx) => (
                          <tr key={mIdx} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-mono text-indigo-300 font-medium whitespace-nowrap">{m.signature}</td>
                            <td className="py-2 px-3 text-slate-400">{m.behavior}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Ready-to-copy Java 21 Code Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Pristine Java 21 LTS Source Code</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    ~{activePojo.actualLocEstimate} LOC (Target {activePojo.locTarget})
                  </span>
                </div>
                <div className="relative rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[380px]">
                    {activePojo.javaCodeTemplate}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">
              No matching component found for the selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
