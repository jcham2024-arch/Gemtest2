import React, { useState } from 'react';
import { WorkbenchSettings } from './types';
import { X, Save, Settings, Download, Upload, Trash2, Cpu } from 'lucide-react';

interface WorkbenchSettingsModalProps {
  isOpen: boolean;
  settings: WorkbenchSettings;
  onClose: () => void;
  onSaveSettings: (settings: WorkbenchSettings) => void;
  onExportSnapshot: () => void;
  onImportSnapshot: () => void;
  onClearAllSessions: () => void;
}

export const WorkbenchSettingsModal: React.FC<WorkbenchSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onExportSnapshot,
  onImportSnapshot,
  onClearAllSessions,
}) => {
  const [cloudProvider, setCloudProvider] = useState(settings.cloudProvider);
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [autoScroll, setAutoScroll] = useState(settings.autoScroll);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      cloudProvider,
      ollamaUrl: ollamaUrl.trim() || 'http://localhost:11434',
      autoScroll,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Workbench Provider & Data Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Inference Execution Engine</label>
            <select
              value={cloudProvider}
              onChange={(e) => setCloudProvider(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini">Google Gemini API (Server Proxy with Search & Thinking)</option>
              <option value="ollama">Local Ollama Loopback (Self-Hosted LLMs)</option>
            </select>
          </div>

          {cloudProvider === 'ollama' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Local Ollama Endpoint</label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Data Backup & Restore */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 block">Workspace Data & Snapshots</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportSnapshot}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export JSON Snapshot</span>
              </button>

              <button
                onClick={onImportSnapshot}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700/60"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import JSON Snapshot</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all sessions?')) {
                  onClearAllSessions();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-900/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Sessions (Reset to Default)</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
