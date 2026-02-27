import { useState, useEffect } from 'react';
import { Menu, X, Kanban } from 'lucide-react';
import BoardSwitcher from './BoardSwitcher';
import ViewToggle from './ViewToggle';
import FilterPanel from './FilterPanel';
import TaskStats from './TaskStats';
import ShortcutsPanel from './ShortcutsPanel';
import type { Column, Task } from '@d-kanban/shared';
import type { BoardMetadata } from '../hooks/useBoards';

interface SidebarProps {
  boards: BoardMetadata[];
  isLoadingBoards: boolean;
  currentView: 'kanban' | 'list' | 'timeline';
  onViewChange: (view: 'kanban' | 'list' | 'timeline') => void;
  onSaveBoard?: (name: string, description?: string, columns?: Column[]) => Promise<unknown>;
  onLoadBoard?: (name: string) => Promise<unknown>;
  onDeleteBoard?: (name: string) => Promise<unknown>;
  onImportBoard?: (name: string, json: string) => Promise<unknown>;
  onRefreshBoards?: () => Promise<unknown>;
  tasks: Task[];
  columns: Column[];
  filters: { priority?: string; status?: string };
  onFiltersChange: (filters: { priority?: string; status?: string }) => void;
}

export default function Sidebar({
  boards,
  isLoadingBoards,
  currentView,
  onViewChange,
  onSaveBoard,
  onLoadBoard,
  onDeleteBoard,
  onImportBoard,
  onRefreshBoards,
  tasks,
  columns,
  filters,
  onFiltersChange,
}: SidebarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(400, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      };
    }
  }, [isResizing]);

  const handleViewChange = (view: 'kanban' | 'list' | 'timeline') => {
    onViewChange(view);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          h-screen
          neumorphic-dark
          transform md:transform-none
          transition-transform duration-300
          z-40
          ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          ${isResizing ? 'select-none' : ''}
        `}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 p-4 neumorphic-dark divider-neumorphic flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Kanban size={24} className="text-gray-800" />
            <h2 className="text-lg font-bold text-gray-800">D-Kanban</h2>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden p-1 hover:bg-gray-300/30 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Sidebar Content - Scrollable */}
        <nav className="overflow-y-auto flex-1 space-y-2 p-4">
          <BoardSwitcher
            boards={boards}
            isLoading={isLoadingBoards}
            onLoadBoard={onLoadBoard}
            onSaveBoard={onSaveBoard}
            onDeleteBoard={onDeleteBoard}
            onImportBoard={onImportBoard}
            onRefreshBoards={onRefreshBoards}
            columns={columns}
          />

          <ViewToggle
            currentView={currentView}
            onViewChange={handleViewChange}
          />

          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          <TaskStats tasks={tasks} columns={columns} />

          <ShortcutsPanel />
        </nav>

        {/* Resize Handle - Desktop Only */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:block absolute right-0 top-0 w-1 h-full bg-gray-400/30 hover:bg-gray-400 cursor-col-resize transition-colors"
          title="Drag to resize sidebar"
        />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        className="fixed md:hidden bottom-6 right-6 p-3 neumorphic-dark text-gray-800 font-bold rounded-full shadow-lg transition-all z-20"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
    </>
  );
}
