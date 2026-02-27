import type { Task, TaskStatus } from '@d-kanban/shared';
import type { DragEvent } from 'react';
import React from 'react';
import TaskCard from './TaskCard';
import { X, Plus, GripVertical } from 'lucide-react';

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

  const handleDragStart = (e: DragEvent) => {
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    dataTransfer!.effectAllowed = 'move';
    dataTransfer!.setData('taskId', (e.target as HTMLElement).getAttribute('data-task-id') || '');
    dataTransfer!.setData('sourceStatus', status as string);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    dataTransfer!.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    const taskId = dataTransfer!.getData('taskId');
    const sourceStatus = dataTransfer!.getData('sourceStatus');

    // Only process if it's actually a task being dropped (has taskId)
    if (taskId && sourceStatus) {
      await onStatusChange(taskId, status);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 min-h-96 flex-shrink-0 w-80 select-none flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-700 hover:text-slate-300 rounded transition-colors flex-shrink-0 text-slate-500" title="Drag to reorder column">
            <GripVertical size={20} className="text-inherit" />
          </div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
        </div>
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
      <div
        className="space-y-3 min-h-64"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={(e) => handleDragStart(e)}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8">No tasks</p>
        )}
      </div>
    </div>
  );
}
