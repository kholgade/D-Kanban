import type { Task, TaskStatus } from '@d-kanban/shared';
import type { DragEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { X, Plus } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus | string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus | string) => Promise<void>;
  onNewTask?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

export default function TaskColumn({
  status,
  title,
  tasks,
  onTaskClick,
  onStatusChange,
  onNewTask,
  canDelete = false,
  onDelete,
}: TaskColumnProps) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: status });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDragStart = (e: DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', status as string);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await onStatusChange(taskId, status);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-slate-800 rounded-lg border border-slate-700 p-4 min-h-96 flex-shrink-0 w-80 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-50 cursor-grab active:cursor-grabbing">{title}</h2>
        <div className="flex gap-1">
          {onNewTask && (
            <button
              onClick={onNewTask}
              className="p-1 text-slate-400 hover:text-violet-400 hover:bg-slate-700 rounded transition-colors"
              title="Add task to this column"
            >
              <Plus size={18} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
              title="Delete column"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={(e) => handleDragStart(e, task)}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
      {tasks.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-8">No tasks</p>
      )}
    </div>
  );
}
