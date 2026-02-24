import BoardMenu from './BoardMenu';
import type { BoardMetadata } from '../hooks/useBoards';
import type { Column } from '@d-kanban/shared';

interface HeaderProps {
  boards?: BoardMetadata[];
  isLoadingBoards?: boolean;
  columns?: Column[];
  onSaveBoard?: (name: string, description?: string, columns?: Column[]) => Promise<unknown>;
  onLoadBoard?: (name: string) => Promise<unknown>;
  onDeleteBoard?: (name: string) => Promise<unknown>;
  onExportBoard?: (name: string) => Promise<string>;
  onImportBoard?: (name: string, json: string) => Promise<unknown>;
  onRefreshBoards?: () => Promise<unknown>;
}

export default function Header({
  boards = [],
  isLoadingBoards = false,
  columns,
  onSaveBoard,
  onLoadBoard,
  onDeleteBoard,
  onExportBoard,
  onImportBoard,
  onRefreshBoards,
}: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-lg">
      <div className="px-6 py-4 max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-violet-400">D-Kanban</h1>
        {onSaveBoard && onLoadBoard && onDeleteBoard && onExportBoard && onImportBoard && onRefreshBoards && (
          <BoardMenu
            boards={boards}
            isLoading={isLoadingBoards}
            columns={columns}
            onSave={onSaveBoard}
            onLoad={onLoadBoard}
            onDelete={onDeleteBoard}
            onExport={onExportBoard}
            onImport={onImportBoard}
            onRefresh={onRefreshBoards}
          />
        )}
      </div>
    </header>
  );
}
