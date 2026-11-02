import React, { useState } from 'react';
import { WorkbenchSettings } from './types';
import { X, Save, User } from 'lucide-react';

interface OperatorProfileModalProps {
  isOpen: boolean;
  settings: WorkbenchSettings;
  onClose: () => void;
  onSaveSettings: (settings: WorkbenchSettings) => void;
}

export const OperatorProfileModal: React.FC<OperatorProfileModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
}) => {
  const [operatorName, setOperatorName] = useState(settings.operatorName);
  const [operatorAvatar, setOperatorAvatar] = useState(settings.operatorAvatar);
  const [workspaceRootPath, setWorkspaceRootPath] = useState(settings.workspaceRootPath);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      operatorName: operatorName.trim() || 'Lead Engineer',
      operatorAvatar: operatorAvatar.trim() || '👤',
      workspaceRootPath: workspaceRootPath.trim() || '/workspace',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Operator Profile</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-slate-400 mb-1 font-medium">Operator Name / Handle</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Avatar</label>
              <input
                type="text"
                value={operatorAvatar}
                onChange={(e) => setOperatorAvatar(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Default Workspace Jail Root</label>
            <input
              type="text"
              value={workspaceRootPath}
              onChange={(e) => setWorkspaceRootPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
            <span className="block mt-1 text-[10px] text-slate-500">
              Verified via McpPathPolicyFilter canonical realpath containment.
            </span>
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
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
