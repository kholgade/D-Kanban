import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import Header from '../components/Header';
import { ToastContainer, useToast } from '../components/Toast';
import { useBoards } from '../hooks/useBoards';
import { useColumns } from '../hooks/useColumns';
import { Plus } from 'lucide-react';

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
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewColumnInput, setShowNewColumnInput] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const boards = useBoards();
  const { columns, addColumn, removeColumn } = useColumns();
  const toast = useToast();

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
    await tasks.createTask(title, description, priority);
    setShowNewTaskModal(false);
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

      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-50">Kanban Board</h1>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            + New Task
          </button>
        </div>

        {tasks.error && (
          <div className="mb-4 p-4 bg-red-950 border border-red-800 text-red-200 rounded-lg">
            {tasks.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Add Column Card */}
          <div className="bg-slate-800 rounded-lg border border-dashed border-slate-600 p-4 min-h-96 flex flex-col items-center justify-center">
            {showNewColumnInput ? (
              <div className="w-full space-y-2">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Column name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newColumnTitle.trim()) {
                        addColumn(newColumnTitle.trim());
                        setNewColumnTitle('');
                        setShowNewColumnInput(false);
                        toast.success('Column added');
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setNewColumnTitle('');
                      setShowNewColumnInput(false);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewColumnInput(true)}
                className="flex items-center gap-2 px-4 py-2 text-violet-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Add Column</span>
              </button>
            )}
          </div>
        </div>
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

      {showNewTaskModal && (
        <TaskModal
          isNew
          onClose={() => setShowNewTaskModal(false)}
          onUpdate={(updates) => handleCreateTask(updates.title || '', updates.description || '', updates.priority || 'low')}
        />
      )}
    </div>
  );
}
