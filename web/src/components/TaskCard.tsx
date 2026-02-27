import { useState } from 'react';
import type { Task, TaskPriority } from '@d-kanban/shared';
import type { DragEvent, ReactNode, MouseEvent } from 'react';
import { AlertCircle, Flag, ChevronDown, ChevronRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: DragEvent) => void;
  onClick: () => void;
  onDragEnd?: (e: DragEvent) => void;
  isSubTask?: boolean;
  isDragSource?: boolean;
  subTasks?: Task[];
  onSubTaskClick?: (task: Task) => void;
  getSubTasks?: (parentId: string) => Task[];
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  important: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-200 text-gray-700',
};

const PRIORITY_ICONS: Record<TaskPriority, ReactNode> = {
  urgent: <AlertCircle size={14} />,
  high: <Flag size={14} />,
  important: <Flag size={14} />,
  low: null,
};

export default function TaskCard({
  task,
  onDragStart,
  onClick,
  onDragEnd,
  isSubTask,
  isDragSource,
  subTasks,
  onSubTaskClick,
  getSubTasks,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const taskSubTasks = subTasks || (getSubTasks ? getSubTasks(task.id) : []);
  const hasSubTasks = taskSubTasks.length > 0;

  const handleDragStart = (e: DragEvent) => {
    onDragStart(e);
  };

  const handleDragEnd = (e: DragEvent) => {
    onDragEnd?.(e);
  };

  const handleExpandClick = (e: MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      draggable={!isExpanded}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => !isExpanded && onClick()}
      className={`group neumorphic-dark transition-all duration-150 ${
        isDragSource ? 'ring-2 ring-blue-500 shadow-xl' : ''
      } ${!isExpanded ? 'cursor-move p-3 hover:shadow-md' : 'p-0'}`}
      style={{
        transform: isDragSource ? 'scale(1.05) rotate(-2deg)' : 'scale(1)',
      }}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <>
          {/* Header with priority indicator */}
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {hasSubTasks && (
                  <button
                    onClick={handleExpandClick}
                    className="p-0.5 hover:bg-gray-300 rounded flex-shrink-0 transition-colors"
                  >
                    <ChevronRight size={14} className="text-gray-600" />
                  </button>
                )}
                {!hasSubTasks && <div className="w-5" />}
                <h3 className={`font-semibold text-gray-800 truncate ${isSubTask ? 'text-xs' : 'text-sm'}`}>
                  {task.title}
                </h3>
              </div>
            </div>
            {PRIORITY_ICONS[task.priority] && (
              <div className={`flex-shrink-0 ${PRIORITY_COLORS[task.priority]} p-1 rounded`}>
                {PRIORITY_ICONS[task.priority]}
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && !isSubTask && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-1">{task.description}</p>
          )}

          {/* Footer with priority and date */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-400/30">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            {hasSubTasks && <span className="text-xs text-gray-600">{taskSubTasks.length} sub</span>}
            {!hasSubTasks && task.scheduledDate && (
              <span className="text-xs text-gray-600">
                {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start gap-2">
            <button
              onClick={handleExpandClick}
              className="p-0.5 hover:bg-gray-300 rounded flex-shrink-0 mt-0.5 transition-colors"
            >
              <ChevronDown size={14} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
              {task.description && <p className="text-xs text-gray-600 mt-1">{task.description}</p>}
            </div>
            {PRIORITY_ICONS[task.priority] && (
              <div className={`flex-shrink-0 ${PRIORITY_COLORS[task.priority]} p-1 rounded`}>
                {PRIORITY_ICONS[task.priority]}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-400/30 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            {task.scheduledDate && (
              <span className="text-gray-600">
                {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {/* Subtasks Tree */}
          {hasSubTasks && (
            <div className="mt-3 pt-2 border-t border-gray-300 space-y-1">
              <p className="text-xs font-medium text-gray-600 mb-2">Sub-tasks</p>
              {taskSubTasks.map((subTask) => (
                <div key={subTask.id} className="pl-3 border-l border-gray-300">
                  <button
                    onClick={() => onSubTaskClick?.(subTask)}
                    className="w-full text-left p-1.5 neumorphic-dark rounded text-xs text-gray-700 hover:text-gray-800 transition-colors"
                  >
                    <div className="font-medium truncate">{subTask.title}</div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      {subTask.status} • {subTask.priority}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onClick()}
            className="w-full mt-2 py-1.5 px-2 text-xs btn-neumorphic transition-colors"
          >
            Edit Task
          </button>
        </div>
      )}
    </div>
  );
}
