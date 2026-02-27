import { useState, ChangeEvent } from 'react';
import SidebarSection from './SidebarSection';
import type { BoardMetadata } from '../hooks/useBoards';
import type { Column } from '@d-kanban/shared';
import { Plus, Upload } from 'lucide-react';

interface BoardSwitcherProps {
  boards: BoardMetadata[];
  isLoading: boolean;
  onLoadBoard?: (name: string) => Promise<unknown>;
  onSaveBoard?: (name: string, description?: string, columns?: Column[]) => Promise<unknown>;
  onDeleteBoard?: (name: string) => Promise<unknown>;
  onImportBoard?: (name: string, json: string) => Promise<unknown>;
  onRefreshBoards?: () => Promise<unknown>;
  columns: Column[];
}

export default function BoardSwitcher({
  boards,
  isLoading,
  onLoadBoard,
  onSaveBoard,
  onDeleteBoard,
  onImportBoard,
  onRefreshBoards,
  columns,
}: BoardSwitcherProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleSaveBoard = async () => {
    if (boardName.trim() && onSaveBoard) {
      await onSaveBoard(boardName.trim(), undefined, columns);
      setBoardName('');
      setShowSaveDialog(false);
      if (onRefreshBoards) await onRefreshBoards();
    }
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBoard) {
      const content = await file.text();
      const name = file.name.replace('.json', '');
      await onImportBoard(name, content);
      setShowImportDialog(false);
      if (onRefreshBoards) await onRefreshBoards();
    }
  };

  return (
    <SidebarSection title="Boards" defaultOpen={true}>
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-xs text-gray-600 py-2">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="text-xs text-gray-600 py-2">No saved boards</div>
        ) : (
          boards.map((board) => (
            <div
              key={board.name}
              className="flex items-center justify-between group"
            >
              <button
                onClick={() => onLoadBoard?.(board.name)}
                className="flex-1 px-2 py-1.5 text-left text-xs btn-neumorphic rounded transition-all truncate"
              >
                {board.name}
              </button>
              <button
                onClick={() => onDeleteBoard?.(board.name)}
                className="opacity-0 group-hover:opacity-100 px-1 py-1 text-gray-600 hover:text-red-600 transition-all text-xs"
              >
                ×
              </button>
            </div>
          ))
        )}

        <div className="flex gap-1 pt-2 border-t border-gray-300">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex-1 px-2 py-1.5 text-xs btn-neumorphic flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Save
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-2 py-1.5 text-xs btn-neumorphic flex items-center justify-center"
          >
            <Upload size={12} />
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="mt-3 p-2 neumorphic-dark rounded space-y-2">
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveBoard();
              if (e.key === 'Escape') setShowSaveDialog(false);
            }}
            placeholder="Board name..."
            autoFocus
            className="w-full input-neumorphic text-xs"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSaveBoard}
              disabled={!boardName.trim()}
              className="flex-1 px-2 py-1 text-xs btn-neumorphic disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 px-2 py-1 text-xs btn-neumorphic"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showImportDialog && (
        <div className="mt-3 p-2 neumorphic-dark rounded">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="w-full text-xs text-gray-700"
          />
        </div>
      )}
    </SidebarSection>
  );
}
