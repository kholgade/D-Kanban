import { useState, useEffect, useMemo, DragEvent } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';
import TaskCard from '../components/TaskCard';
import ListView from '../components/ListView';
import TimelineView from '../components/TimelineView';
import TaskModal from '../components/TaskModal';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ToastContainer, useToast } from '../components/Toast';
import { useBoards } from '../hooks/useBoards';
import { useColumns } from '../hooks/useColumns';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (title: string, description: string, priority?: string, parentTaskId?: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getSubTasks: (parentId: string) => Task[];
}

interface KanbanBoardProps {
  tasks: UseTasksReturn;
}

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskContext, setNewTaskContext] = useState<{ isOpen: boolean; columnStatus: string | null }>({ isOpen: false, columnStatus: null });
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('slate');
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'timeline'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ priority?: string; status?: string }>({});

  const boards = useBoards();
  const { columns, addColumn, reorderColumns } = useColumns();
  const toast = useToast();

  useEffect(() => {
    boards.listBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesStatus = !filters.status || task.status === filters.status;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks.tasks, searchQuery, filters]);

  const handleColumnDragStart = (e: DragEvent<HTMLDivElement>, fromIndex: number) => {
    setDraggedColumnIndex(fromIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dragType', 'column');
  };

  const handleColumnDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (draggedColumnIndex !== null) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleColumnDrop = (e: DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex !== null && draggedColumnIndex !== toIndex) {
      const newColumns = [...columns];
      const [movedColumn] = newColumns.splice(draggedColumnIndex, 1);
      newColumns.splice(toIndex, 0, movedColumn);
      reorderColumns(newColumns);
      toast.success('Column reordered');
    }
    setDraggedColumnIndex(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

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
      addColumn(newColumnName.trim(), newColumnColor);
      setNewColumnName('');
      setNewColumnColor('slate');
      setShowNewColumnDialog(false);
      toast.success('Column added');
    }
  };

  const getColumnBorderColor = (color?: string): string => {
    const colorMap: Record<string, string> = {
      slate: 'border-slate-600',
      blue: 'border-blue-500',
      red: 'border-red-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      yellow: 'border-yellow-500',
      pink: 'border-pink-500',
      indigo: 'border-indigo-500',
    };
    return colorMap[color || 'slate'] || 'border-slate-600';
  };

  return (
    <div className="flex h-screen bg-slate-950 relative">
      <Sidebar
        boards={boards.boards}
        isLoadingBoards={boards.isLoading}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSaveBoard={boards.saveBoard}
        onLoadBoard={async (name) => {
          const board = await boards.loadBoard(name);
          if (board) {
            window.location.reload();
          }
        }}
        onDeleteBoard={boards.deleteBoard}
        onImportBoard={async (name, json) => {
          await boards.importBoard(name, json);
          window.location.reload();
        }}
        onRefreshBoards={boards.listBoards}
        tasks={filteredTasks}
        columns={columns}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <Header onSearch={setSearchQuery} />

        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="mb-4 flex justify-between items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
            <button
              onClick={() => setShowNewColumnDialog(true)}
              className="px-4 py-2 text-sm btn-neumorphic"
            >
              + Column
            </button>
          </div>

          {tasks.error && (
            <div className="mb-4 p-4 bg-red-950 border border-red-800 text-red-200 rounded-lg flex-shrink-0">
              {tasks.error}
            </div>
          )}

          {currentView === 'kanban' && (
            <div className="flex-1 overflow-auto">
              <div
                className="grid gap-4 h-fit pb-4 pr-4"
                style={{
                  gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))`,
                }}
              >
                {columns.map((col, index) => {
                  const columnTasks = filteredTasks.filter((t) => t.status === col.status && !t.parentTaskId);
                  return (
                    <div key={`col-${col.status}`} className="flex flex-col h-fit">
                      {/* Column Header */}
                      <div
                        draggable
                        onDragStart={(e) => handleColumnDragStart(e, index)}
                        onDragOver={handleColumnDragOver}
                        onDrop={(e) => handleColumnDrop(e, index)}
                        onDragEnd={handleColumnDragEnd}
                        className={`neumorphic-dark border-l-4 ${getColumnBorderColor(col.color)} px-4 py-3 mb-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-sm font-semibold text-gray-800">{col.title}</h2>
                            <span className="text-xs text-gray-600">{columnTasks.length}</span>
                          </div>
                          <button
                            onClick={() => setNewTaskContext({ isOpen: true, columnStatus: col.status })}
                            className="px-2 py-1 text-sm text-gray-600 font-bold hover:text-gray-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Column Tasks Area */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const taskId = e.dataTransfer.getData('taskId');
                          if (taskId) {
                            handleTaskStatusChange(taskId, col.status);
                          }
                        }}
                        className="flex-1 space-y-2 min-h-48 rounded-lg border-2 border-gray-300/50 p-3 bg-gray-50/50 transition-all hover:border-blue-400/30 hover:bg-white/50"
                      >
                        {columnTasks.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-gray-500">No tasks</div>
                        ) : (
                          columnTasks
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('taskId', task.id);
                                  e.dataTransfer.setData('sourceStatus', task.status);
                                }}
                                onClick={() => setSelectedTask(task)}
                                getSubTasks={tasks.getSubTasks}
                                onSubTaskClick={setSelectedTask}
                              />
                            ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentView === 'list' && (
            <ListView
              tasks={filteredTasks}
              columns={columns}
              onTaskClick={setSelectedTask}
              onStatusChange={handleTaskStatusChange}
              onDeleteTask={tasks.deleteTask}
              getSubTasks={tasks.getSubTasks}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
            />
          )}
        </main>

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          subTasks={selectedTask.parentTaskId ? undefined : tasks.getSubTasks(selectedTask.id)}
          availableStatuses={columns.map((col) => col.status)}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => {
            await tasks.updateTask(selectedTask.id, updates);
          }}
          onDelete={async () => {
            await tasks.deleteTask(selectedTask.id);
            setSelectedTask(null);
          }}
          onCreateSubTask={
            !selectedTask.parentTaskId
              ? async (title: string, priority: string) => {
                  await tasks.createTask(title, '', priority, selectedTask.id);
                }
              : undefined
          }
          onDeleteSubTask={
            !selectedTask.parentTaskId
              ? async (subTaskId: string) => {
                  await tasks.deleteTask(subTaskId);
                }
              : undefined
          }
        />
      )}

      {newTaskContext.isOpen && (
        <TaskModal
          isNew
          defaultStatus={newTaskContext.columnStatus || undefined}
          availableStatuses={columns.map((col) => col.status)}
          onClose={() => setNewTaskContext({ isOpen: false, columnStatus: null })}
          onUpdate={(updates) => handleCreateTask(updates.title || '', updates.description || '', updates.priority || 'low')}
        />
      )}

      {showNewColumnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowNewColumnDialog(false)}>
          <div className="neumorphic-dark w-full max-w-md mx-4 flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-0 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Add New Column</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Column Name</label>
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
                  className="w-full input-neumorphic"
                  placeholder="e.g., Review, Testing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'slate', bgClass: 'bg-slate-500' },
                    { name: 'blue', bgClass: 'bg-blue-500' },
                    { name: 'red', bgClass: 'bg-red-500' },
                    { name: 'green', bgClass: 'bg-green-500' },
                    { name: 'purple', bgClass: 'bg-purple-500' },
                    { name: 'yellow', bgClass: 'bg-yellow-500' },
                    { name: 'pink', bgClass: 'bg-pink-500' },
                    { name: 'indigo', bgClass: 'bg-indigo-500' },
                  ].map(({ name, bgClass }) => (
                    <button
                      key={name}
                      onClick={() => setNewColumnColor(name)}
                      className={`h-8 rounded border-2 transition-all flex items-center justify-center ${bgClass} ${
                        newColumnColor === name
                          ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-violet-500'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      title={name.charAt(0).toUpperCase() + name.slice(1)}
                    >
                      {newColumnColor === name && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 divider-neumorphic flex-shrink-0">
              <button
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
                className="flex-1 btn-neumorphic disabled:opacity-50"
              >
                Add Column
              </button>
              <button
                onClick={() => setShowNewColumnDialog(false)}
                className="px-4 py-2 btn-neumorphic"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
