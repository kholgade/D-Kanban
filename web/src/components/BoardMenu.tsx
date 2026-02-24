import { useState } from 'react';
import type { BoardMetadata } from '../hooks/useBoards';
import type { Column } from '@d-kanban/shared';
import { DEFAULT_COLUMNS } from '@d-kanban/shared';
import { ChevronDown } from 'lucide-react';

interface BoardMenuProps {
  boards: BoardMetadata[];
  isLoading: boolean;
  columns?: Column[];
  onSave: (name: string, description?: string, columns?: Column[]) => Promise<unknown>;
  onLoad: (name: string) => Promise<unknown>;
  onDelete: (name: string) => Promise<unknown>;
  onExport: (name: string) => Promise<string>;
  onImport: (name: string, json: string) => Promise<unknown>;
  onRefresh: () => Promise<unknown>;
}

export default function BoardMenu({
  boards,
  isLoading,
  columns = DEFAULT_COLUMNS,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
  onRefresh,
}: BoardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [importName, setImportName] = useState('');
  const [importJson, setImportJson] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setIsSaving(true);
    try {
      await onSave(saveName.trim(), saveDescription, columns);
      setSaveName('');
      setSaveDescription('');
      setShowSaveModal(false);
      await onRefresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async () => {
    if (!importName.trim() || !importJson.trim()) return;
    setIsImporting(true);
    try {
      await onImport(importName.trim(), importJson.trim());
      setImportName('');
      setImportJson('');
      setShowImportModal(false);
      await onRefresh();
    } finally {
      setIsImporting(false);
    }
  };

  const handleLoad = async (boardName: string) => {
    await onLoad(boardName);
    setIsOpen(false);
  };

  const handleExport = async (boardName: string) => {
    const json = await onExport(boardName);
    const element = document.createElement('a');
    element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(json)}`);
    element.setAttribute('download', `${boardName}.dboard.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async (boardName: string) => {
    if (confirm(`Delete board "${boardName}"? This cannot be undone.`)) {
      await onDelete(boardName);
      await onRefresh();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-50 font-medium rounded-lg hover:bg-slate-600 transition-colors"
      >
        Boards
        <ChevronDown size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-40 min-w-64">
          <div className="p-3 border-b border-slate-700 space-y-2">
            <button
              onClick={() => {
                setShowSaveModal(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-50 hover:bg-slate-700 rounded transition-colors"
            >
              💾 Save Board
            </button>
            <button
              onClick={() => {
                setShowImportModal(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-50 hover:bg-slate-700 rounded transition-colors"
            >
              📥 Import Board
            </button>
            <button
              onClick={() => {
                onRefresh();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-50 hover:bg-slate-700 rounded transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-3 text-center text-slate-400">Loading boards...</div>
          ) : boards.length === 0 ? (
            <div className="p-3 text-center text-slate-400">No saved boards</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {boards.map((board) => (
                <div
                  key={board.name}
                  className="px-3 py-2 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-50 font-medium truncate">{board.name}</p>
                      <p className="text-xs text-slate-400">{board.taskCount} tasks</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoad(board.name)}
                        className="px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleExport(board.name)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleDelete(board.name)}
                        className="px-2 py-1 text-xs bg-red-900 text-red-100 rounded hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
          <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-slate-800 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-violet-400 mb-4">Save Board</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Board Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="My Board"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Board description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !saveName.trim()}
                  className="flex-1 py-2 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-slate-800 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-violet-400 mb-4">Import Board</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Board Name</label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Imported Board"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">JSON Content</label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none h-32 font-mono text-xs"
                  placeholder="Paste board JSON here..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={isImporting || !importName.trim() || !importJson.trim()}
                  className="flex-1 py-2 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
