import { useState } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import Header from '../components/Header';

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

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'blocked', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'blocked': 'Blocked',
  'done': 'Done',
};

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.tasks.find((t) => t.id === taskId);
    if (task) {
      await tasks.updateTask(taskId, { status: newStatus });
    }
  };

  const handleCreateTask = async (title: string, description: string, priority: string = 'low') => {
    await tasks.createTask(title, description, priority);
    setShowNewTaskModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

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
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              title={STATUS_LABELS[status]}
              tasks={tasks.getTasksByStatus(status)}
              onTaskClick={setSelectedTask}
              onStatusChange={handleTaskStatusChange}
            />
          ))}
        </div>
      </main>

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
