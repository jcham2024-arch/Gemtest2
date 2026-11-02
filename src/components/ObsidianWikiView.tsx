import React, { useState } from 'react';
import { OBSIDIAN_WIKI_PAGES } from '../data/projectData';
import { WikiPage } from '../types/architecture';
import {
  Network,
  FileText,
  Tag,
  Link2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface ObsidianWikiViewProps {
  onNavigateToPojo: (pojoName: string) => void;
}

export const ObsidianWikiView: React.FC<ObsidianWikiViewProps> = ({
  onNavigateToPojo,
}) => {
  const [selectedPageFile, setSelectedPageFile] = useState<string>('INDEX.md');

  const activePage: WikiPage =
    OBSIDIAN_WIKI_PAGES.find((p) => p.file === selectedPageFile) ||
    OBSIDIAN_WIKI_PAGES[0];

  const handleWikiLinkClick = (rawLink: string) => {
    // rawLink can be "docs/security/SecureSecret" or "[[docs/security/SecureSecret|label]]"
    let target = rawLink.replace(/\[\[|\]\]/g, '');
    if (target.includes('|')) {
      target = target.split('|')[0];
    }
    const targetFile = target.endsWith('.md') ? target : `${target}.md`;
    const found = OBSIDIAN_WIKI_PAGES.find(
      (p) => p.file === targetFile || p.file.includes(target)
    );
    if (found) {
      setSelectedPageFile(found.file);
    } else {
      // Fallback: check if it's a POJO
      const parts = target.split('/');
      const lastName = parts[parts.length - 1];
      onNavigateToPojo(lastName);
    }
  };

  const renderContentWithWikiLinks = (text: string) => {
    const parts: React.ReactNode[] = [];
    const wikiRegex = /\[\[(.*?)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = wikiRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const inner = match[1];
      const [linkPath, label] = inner.includes('|')
        ? inner.split('|')
        : [inner, inner.split('/').pop()];

      parts.push(
        <button
          key={match.index}
          onClick={() => handleWikiLinkClick(linkPath)}
          className="text-indigo-400 hover:text-indigo-300 font-mono font-medium underline decoration-indigo-500/40 hover:decoration-indigo-400 inline-flex items-center gap-1 cursor-pointer mx-0.5"
        >
          <span>{label || linkPath}</span>
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Bi-Directional Retrieval Graph
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Obsidian Knowledge Graph & Markdown Architecture
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          Downstream LLM agents navigate this explicit graph via <code className="text-indigo-300 font-mono">INDEX.md</code> and <code className="text-indigo-300 font-mono">[[WikiLinks]]</code> rather than consuming full directory file trees. Each module strictly limits its reading overhead to &lt; 400 tokens.
        </p>
      </div>

      {/* Visual Interactive Graph Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Interactive Node Topology (Click node to open)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {OBSIDIAN_WIKI_PAGES.length} Nodes · Active: {activePage.file}
          </span>
        </div>

        {/* Node Grid Map */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {OBSIDIAN_WIKI_PAGES.map((page) => {
            const isSelected = page.file === activePage.file;
            const isRoot = page.file === 'INDEX.md';

            return (
              <button
                key={page.file}
                onClick={() => setSelectedPageFile(page.file)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                    : isRoot
                    ? 'bg-slate-950 border-indigo-800/60 hover:border-indigo-600'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-mono font-semibold ${isRoot ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {page.id}
                  </span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {page.contextCost} tkn
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 line-clamp-1">{page.title}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">{page.file}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Markdown Document Reader */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Document Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
              <span>{activePage.file}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{activePage.module}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 tabular-nums">Context Cost: ~{activePage.contextCost} tokens</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{activePage.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {activePage.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 text-slate-400 border border-slate-800 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* YAML Frontmatter Box */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-400 space-y-1">
          <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
            --- YAML Frontmatter ---
          </div>
          <div>id: <span className="text-indigo-300 font-semibold">{activePage.id}</span></div>
          <div>title: <span className="text-slate-200">"{activePage.title}"</span></div>
          <div>type: <span className="text-emerald-300">{activePage.type}</span></div>
          <div>module: <span className="text-slate-300">{activePage.module}</span></div>
          <div>context_cost: <span className="text-amber-300 tabular-nums">{activePage.contextCost}</span></div>
          <div>tags: [{activePage.tags.join(', ')}]</div>
          <div>
            related_links: [{activePage.relatedLinks.join(', ')}]
          </div>
          <div className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold pt-1">
            ---
          </div>
        </div>

        {/* Rendered Document Body */}
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
          {activePage.content.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('# ')) {
              return null; // Already rendered in title
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h4 key={pIdx} className="text-lg font-bold text-white mt-6 mb-2 border-b border-slate-800 pb-1">
                  {paragraph.replace('## ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-1.5 text-slate-300 my-2">
                  {items.map((it, itIdx) => (
                    <li key={itIdx}>
                      {renderContentWithWikiLinks(it.replace(/^- /, ''))}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={pIdx} className="leading-relaxed">
                {renderContentWithWikiLinks(paragraph)}
              </p>
            );
          })}
        </div>

        {/* Related Wiki Links Section */}
        {activePage.relatedLinks.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bi-Directional Wiki Connections</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePage.relatedLinks.map((link, lIdx) => (
                <button
                  key={lIdx}
                  onClick={() => handleWikiLinkClick(link)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-mono text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{link}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
