import React, { useState, useRef, useEffect } from 'react';
import { StreamPerspective, AgentDefinition } from './types';
import { 
  Send, 
  Bot, 
  User, 
  Cpu, 
  FolderGit2, 
  Sliders, 
  Sparkles, 
  Paperclip 
} from 'lucide-react';

interface AgentInputDeckProps {
  activeAgent: AgentDefinition;
  isStreaming: boolean;
  onSendMessage: (
    content: string, 
    perspective: StreamPerspective, 
    options?: { temperature?: number; searchGrounding?: boolean }
  ) => void;
  onOpenWorkspaceLink: () => void;
}

export const AgentInputDeck: React.FC<AgentInputDeckProps> = ({
  activeAgent,
  isStreaming,
  onSendMessage,
  onOpenWorkspaceLink,
}) => {
  const [content, setContent] = useState('');
  const [perspective, setPerspective] = useState<StreamPerspective>('ACTIVE_AGENT');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [temperature, setTemperature] = useState(activeAgent.temperature || 0.3);
  const [searchGrounding, setSearchGrounding] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() || isStreaming) return;
    onSendMessage(content.trim(), perspective, { temperature, searchGrounding });
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 p-3 select-none">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Stream Perspective / Role Selector (Specialized from Perchance Persona selector) */}
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setPerspective('ACTIVE_AGENT')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                perspective === 'ACTIVE_AGENT'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{activeAgent.name.split(' ')[0]} (Agent)</span>
            </button>

            <button
              onClick={() => setPerspective('OPERATOR')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                perspective === 'OPERATOR'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Operator</span>
            </button>

            <button
              onClick={() => setPerspective('SYSTEM_KERNEL')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                perspective === 'SYSTEM_KERNEL'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Kernel Rule</span>
            </button>

            <button
              onClick={onOpenWorkspaceLink}
              className="px-2.5 py-1 rounded-md flex items-center gap-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Attach Workspace File or Directory Tree"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace Link</span>
            </button>
          </div>

          {/* Quick Options Drawer Toggle */}
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] border cursor-pointer transition-colors ${
              isOptionsOpen
                ? 'bg-slate-800 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>options</span>
          </button>
        </div>

        {/* Options Drawer Content */}
        {isOptionsOpen && (
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs space-y-2 text-slate-300">
            <div className="flex items-center justify-between">
              <span>Sampling Temperature: <span className="font-mono text-indigo-400">{temperature.toFixed(2)}</span></span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-36 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Search Grounding (gemini-3.8-flash)</span>
              </span>
              <input
                type="checkbox"
                checked={searchGrounding}
                onChange={(e) => setSearchGrounding(e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Input Textarea and Send Action */}
        <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 focus-within:border-indigo-500/70 transition-colors shadow-inner">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              perspective === 'SYSTEM_KERNEL'
                ? 'Inject system invariant constraint (e.g. "Do not use java.util.logging")...'
                : perspective === 'OPERATOR'
                ? 'Type human feedback or direction for the subagent...'
                : `Type prompt to ${activeAgent.name}... (Press Enter to send, Shift+Enter for newline)`
            }
            rows={1}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed max-h-44"
          />

          <button
            onClick={handleSend}
            disabled={!content.trim() || isStreaming}
            className={`p-2 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              content.trim() && !isStreaming
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
