import type { Task, Column } from '@d-kanban/shared';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Trash2, Edit2, AlertCircle, Flag } from 'lucide-react';
import { useState } from 'react';

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  getSubTasks: (parentId: string) => Task[];
}

const PRIORITY_ICONS: Record<string, ReactNode> = {
  'urgent': <AlertCircle size={12} className="text-red-500" />,
  'high': <Flag size={12} className="text-orange-500" />,
  'important': <Flag size={12} className="text-blue-500" />,
  'low': null,
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  'done': 'text-green-600 font-medium',
  'blocked': 'text-red-600 font-medium',
  'in-progress': 'text-blue-600 font-medium',
  'todo': 'text-gray-600 font-medium',
};

export default function ListView({
  tasks,
  columns,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  getSubTasks,
}: ListViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const rootTasks = tasks.filter((t) => !t.parentTaskId);

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4">
      <div className="space-y-2">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-700 rounded-3xl border border-gray-300 shadow-md" style={{boxShadow: '3px 3px 6px #bdbdbd, -3px -3px 6px #ffffff'}}>
          <div className="col-span-1"></div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Task Rows */}
        {rootTasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-600 text-sm rounded-3xl border border-gray-300 bg-white">
            No tasks. Create one to get started!
          </div>
        ) : (
          rootTasks.map((task) => {
            const subTasks = getSubTasks(task.id);
            const isExpanded = expandedTasks.has(task.id);

            return (
              <div key={task.id} className="rounded-3xl border border-gray-300 overflow-hidden bg-white">
                {/* Parent Task Row */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 items-center hover:bg-gray-100 bg-white border-b border-gray-200">
                  {/* Expand Button */}
                  <div className="col-span-1 flex justify-center">
                    {subTasks.length > 0 ? (
                      <button
                        onClick={() => toggleExpanded(task.id)}
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-gray-600" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-600" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  {/* Title + Priority */}
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">{task.title}</span>
                    {PRIORITY_ICONS[task.priority] && (
                      <span className="flex-shrink-0">{PRIORITY_ICONS[task.priority]}</span>
                    )}
                    {subTasks.length > 0 && (
                      <span className="text-xs text-gray-500 flex-shrink-0">({subTasks.length})</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs px-0 py-0 bg-transparent border-0 cursor-pointer outline-none ${STATUS_BADGE_COLORS[task.status]}`}
                    >
                      {columns.map((col) => (
                        <option key={col.status} value={col.status}>
                          {col.title.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-gray-600">
                    {task.scheduledDate
                      ? new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-1 justify-end">
                    <button
                      onClick={() => onTaskClick(task)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Sub-tasks */}
                {isExpanded &&
                  subTasks.map((subTask, index) => (
                    <div
                      key={subTask.id}
                      className={`grid grid-cols-12 gap-2 px-4 py-2 items-center hover:bg-gray-100 bg-gray-50 border-l-4 border-l-gray-300 ${
                        index < subTasks.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      {/* Placeholder for expand button */}
                      <div className="col-span-1 flex justify-center">
                        <span className="text-gray-400 text-xs">↳</span>
                      </div>

                      {/* Title + Priority */}
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        <span className="text-sm text-gray-700 truncate">{subTask.title}</span>
                        {PRIORITY_ICONS[subTask.priority] && (
                          <span className="flex-shrink-0">{PRIORITY_ICONS[subTask.priority]}</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <select
                          value={subTask.status}
                          onChange={(e) => onStatusChange(subTask.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs px-0 py-0 bg-transparent border-0 cursor-pointer outline-none ${STATUS_BADGE_COLORS[subTask.status]}`}
                        >
                          {columns.map((col) => (
                            <option key={col.status} value={col.status}>
                              {col.title.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-xs text-gray-600">
                        {subTask.scheduledDate
                          ? new Date(subTask.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : new Date(subTask.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onTaskClick(subTask)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteTask(subTask.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
