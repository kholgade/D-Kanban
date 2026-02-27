import { useState } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';
import type { DragEvent } from 'react';
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskCard from './TaskCard';

interface TaskRowProps {
  task: Task;
  columns: (TaskStatus | string)[];
  subTasks: Task[];
  isExpanded: boolean;
  onExpandToggle: () => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus | string) => Promise<void>;
  onDragStart: (e: DragEvent) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'done': 'bg-green-100 text-green-700',
  'blocked': 'bg-red-100 text-red-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  'todo': 'bg-gray-200 text-gray-700',
};

export default function TaskRow({
  task,
  columns,
  subTasks,
  isExpanded,
  onExpandToggle,
  onTaskClick,
  onStatusChange,
  onDragStart,
}: TaskRowProps) {
  const [draggedSubTaskId, setDraggedSubTaskId] = useState<string | null>(null);

  const handleSubTaskDragStart = (e: DragEvent, subTask: Task) => {
    e.stopPropagation();
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    dataTransfer!.effectAllowed = 'move';
    dataTransfer!.setData('taskId', subTask.id);
    dataTransfer!.setData('sourceStatus', subTask.status);
    setDraggedSubTaskId(subTask.id);
  };

  const handleSubTaskDragEnd = () => {
    setDraggedSubTaskId(null);
  };

  const handleColumnDragOver = (e: DragEvent) => {
    e.preventDefault();
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    dataTransfer!.dropEffect = 'move';
  };

  const handleColumnDrop = async (e: DragEvent, targetStatus: TaskStatus | string) => {
    e.preventDefault();
    const evt = e as unknown as React.DragEvent<HTMLDivElement>;
    const dataTransfer = evt.dataTransfer;
    const taskId = dataTransfer!.getData('taskId');
    if (taskId) {
      await onStatusChange(taskId, targetStatus);
    }
    setDraggedSubTaskId(null);
  };

  const getStatusBgColor = (status: TaskStatus | string) => {
    return STATUS_COLORS[status] || 'bg-slate-700 text-slate-300';
  };

  return (
    <>
      {/* Parent task row (full width band) */}
      <div
        draggable
        onDragStart={onDragStart}
        className="col-span-full neumorphic-dark border-l-4 border-gray-400 rounded-lg p-3 flex items-center gap-3 hover:shadow-md cursor-move transition-all overflow-hidden"
        style={{ maxHeight: '100px' }}
      >
        {/* Expand/collapse toggle */}
        {subTasks.length > 0 && (
          <button
            onClick={onExpandToggle}
            className="p-1 hover:bg-gray-300 rounded transition-colors flex-shrink-0 text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        )}
        {subTasks.length === 0 && <div className="w-7 flex-shrink-0" />}

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{task.title}</h3>
        </div>

        {/* Status badge */}
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${getStatusBgColor(task.status)}`}>
          {task.status}
        </span>

        {/* Sub-task count */}
        {subTasks.length > 0 && (
          <span className="text-xs text-gray-600 flex-shrink-0">
            {subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Click to edit */}
        <button
          onClick={() => onTaskClick(task)}
          className="px-2 py-1 text-xs btn-neumorphic rounded transition-colors flex-shrink-0"
        >
          Edit
        </button>
      </div>

      {/* Sub-tasks row (only visible when expanded) */}
      {isExpanded && subTasks.length > 0 && (
        <div
          className="col-span-full grid gap-4 p-3"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))`,
          }}
        >
          {columns.map((columnStatus) => {
            const columnSubTasks = subTasks.filter((st) => st.status === columnStatus);
            const isActiveDrop = draggedSubTaskId !== null;
            return (
              <div
                key={columnStatus}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, columnStatus)}
                className={`neumorphic-dark border-l-4 rounded-lg p-3 min-h-32 transition-all duration-200 ${
                  isActiveDrop
                    ? 'border-violet-500 shadow-lg'
                    : 'border-gray-300'
                }`}
              >
                {columnSubTasks.map((subTask) => (
                  <div key={subTask.id} className="mb-3 last:mb-0">
                    <TaskCard
                      task={subTask}
                      onDragStart={(e) => handleSubTaskDragStart(e, subTask)}
                      onClick={() => onTaskClick(subTask)}
                      onDragEnd={handleSubTaskDragEnd}
                      isSubTask
                      isDragSource={draggedSubTaskId === subTask.id}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
