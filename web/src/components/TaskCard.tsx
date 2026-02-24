import type { Task, TaskPriority } from '@d-kanban/shared';
import type { DragEvent } from 'react';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: DragEvent) => void;
  onClick: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'bg-red-900 text-red-100',
  high: 'bg-yellow-900 text-yellow-100',
  important: 'bg-cyan-900 text-cyan-100',
  low: 'bg-gray-700 text-gray-200',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  important: 'Important',
  low: 'Low',
};

export default function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const getBorderClass = () => {
    switch (task.status) {
      case 'done':
        return 'border-green-500';
      case 'blocked':
        return 'border-red-500';
      case 'in-progress':
        return 'border-yellow-500';
      default:
        return 'border-slate-600';
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`p-3 bg-slate-700 border ${getBorderClass()} rounded-lg hover:shadow-lg hover:border-violet-500 cursor-move transition-all hover:bg-slate-650`}
    >
      <h3 className="font-medium text-slate-50 text-sm truncate">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-block px-2 py-1 ${PRIORITY_COLORS[task.priority]} text-xs font-medium rounded`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
    </div>
  );
}
