import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import Header from '../components/Header';
import { ToastContainer, useToast } from '../components/Toast';
import { useBoards } from '../hooks/useBoards';
import { useColumns } from '../hooks/useColumns';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (title: string, description: string, priority?: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

interface KanbanBoardProps {
  tasks: UseTasksReturn;
}

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskContext, setNewTaskContext] = useState<{ isOpen: boolean; columnStatus: string | null }>({ isOpen: false, columnStatus: null });
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const boards = useBoards();
  const { columns, addColumn, removeColumn, reorderColumns } = useColumns();
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.status === active.id);
      const newIndex = columns.findIndex((col) => col.status === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        reorderColumns(newColumns);
      }
    }
  };

  useEffect(() => {
    boards.listBoards();
  }, [boards]);

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus | string) => {
    const task = tasks.tasks.find((t) => t.id === taskId);
    if (task) {
      await tasks.updateTask(taskId, { status: newStatus as TaskStatus });
    }
  };

  const handleCreateTask = async (title: string, description: string, priority: string = 'low') => {
    const task = await tasks.createTask(title, description, priority);
    if (newTaskContext.columnStatus && newTaskContext.columnStatus !== 'todo') {
      await tasks.updateTask(task.id, { status: newTaskContext.columnStatus as TaskStatus });
    }
    setNewTaskContext({ isOpen: false, columnStatus: null });
  };

  const handleAddColumn = async () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim());
      setNewColumnName('');
      setShowNewColumnDialog(false);
      toast.success('Column added');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        boards={boards.boards}
        isLoadingBoards={boards.isLoading}
        columns={columns}
        onSaveBoard={boards.saveBoard}
        onLoadBoard={async (name) => {
          const board = await boards.loadBoard(name);
          if (board) {
            window.location.reload();
          }
        }}
        onDeleteBoard={boards.deleteBoard}
        onExportBoard={boards.exportBoard}
        onImportBoard={async (name, json) => {
          await boards.importBoard(name, json);
          window.location.reload();
        }}
        onRefreshBoards={boards.listBoards}
      />

      <main className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-50">Kanban Board</h1>
          <button
            onClick={() => setShowNewColumnDialog(true)}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            + New Column
          </button>
        </div>

        {tasks.error && (
          <div className="mb-4 p-4 bg-red-950 border border-red-800 text-red-200 rounded-lg">
            {tasks.error}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columns.map((c) => c.status)} strategy={horizontalListSortingStrategy}>
            <div className="flex overflow-x-auto gap-6 pb-4">
              {columns.map((col) => {
            const columnTasks = tasks.getTasksByStatus(col.status);
            const canDelete = columns.length > 1 && columnTasks.length === 0;

            return (
              <TaskColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={columnTasks}
                onTaskClick={setSelectedTask}
                onStatusChange={handleTaskStatusChange}
                onNewTask={() => setNewTaskContext({ isOpen: true, columnStatus: col.status })}
                canDelete={canDelete}
                onDelete={() => {
                  const deleted = removeColumn(col.status, columnTasks.length);
                  if (!deleted) {
                    if (columns.length <= 1) {
                      toast.error('Cannot delete the last column');
                    } else {
                      toast.error('Cannot delete column with tasks');
                    }
                  } else {
                    toast.success(`Column "${col.title}" deleted`);
                  }
                }}
              />
            );
            })}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => {
            await tasks.updateTask(selectedTask.id, updates);
          }}
          onDelete={async () => {
            await tasks.deleteTask(selectedTask.id);
            setSelectedTask(null);
          }}
        />
      )}

      {newTaskContext.isOpen && (
        <TaskModal
          isNew
          defaultStatus={newTaskContext.columnStatus || undefined}
          onClose={() => setNewTaskContext({ isOpen: false, columnStatus: null })}
          onUpdate={(updates) => handleCreateTask(updates.title || '', updates.description || '', updates.priority || 'low')}
        />
      )}

      {showNewColumnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowNewColumnDialog(false)}>
          <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-slate-800 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-violet-400 mb-4">Add New Column</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Column Name</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddColumn();
                    }
                  }}
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="e.g., Review, Testing"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim()}
                  className="flex-1 py-2 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  Add Column
                </button>
                <button
                  onClick={() => setShowNewColumnDialog(false)}
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
