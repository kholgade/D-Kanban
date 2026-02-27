import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskPriority, TaskStatus } from '@d-kanban/shared';
import { X } from 'lucide-react';

interface TaskModalProps {
  task?: Task;
  isNew?: boolean;
  defaultStatus?: string;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  subTasks?: Task[];
  onCreateSubTask?: (title: string, priority: string) => Promise<void>;
  onDeleteSubTask?: (subTaskId: string) => Promise<void>;
  availableStatuses?: string[];
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
  { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'important', label: 'Important', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'low', label: 'Low', color: 'bg-gray-200 text-gray-700' },
];

export default function TaskModal({
  task,
  isNew,
  defaultStatus,
  onClose,
  onUpdate,
  onDelete,
  subTasks,
  onCreateSubTask,
  onDeleteSubTask,
  availableStatuses = ['todo', 'in-progress', 'blocked', 'done'],
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'low');
  const [status, setStatus] = useState<string>(task?.status || defaultStatus || 'todo');
  const [scheduledDate, setScheduledDate] = useState(task?.scheduledDate || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubTaskForm, setShowSubTaskForm] = useState(false);
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskPriority, setSubTaskPriority] = useState<TaskPriority>('low');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updates: Partial<Task> = {
        title,
        description,
        priority,
        status: status as TaskStatus,
        scheduledDate: scheduledDate || undefined,
      };
      await onUpdate(updates);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !task) return;
    if (confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await onDelete();
        onClose();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateSubTask = async () => {
    if (!onCreateSubTask || !subTaskTitle.trim()) return;
    try {
      await onCreateSubTask(subTaskTitle, subTaskPriority);
      setSubTaskTitle('');
      setShowSubTaskForm(false);
    } catch (err) {
      console.error('Failed to create sub-task:', err);
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    if (!onDeleteSubTask) return;
    if (confirm('Delete this sub-task?')) {
      try {
        await onDeleteSubTask(subTaskId);
      } catch (err) {
        console.error('Failed to delete sub-task:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="neumorphic-dark w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 flex-shrink-0 divider-neumorphic">
            <h2 className="text-lg font-bold text-gray-800">
              {isNew ? 'New Task' : 'Edit Task'}
            </h2>
          </div>

          {/* Main Fields */}
          <div className="px-4 pt-4 pb-2 space-y-3 flex-shrink-0">
            {/* Title Row */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full input-neumorphic text-sm"
                placeholder="Task title"
                required
              />
            </div>

            {/* Description Row */}
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full input-neumorphic resize-none text-sm h-16"
                placeholder="Description"
              />
            </div>

            {/* Priority, Status, Scheduled Date Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full select-neumorphic text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full select-neumorphic text-sm"
                >
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full input-neumorphic text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sub-tasks Section */}
          {!isNew && (
            <div className="px-4 py-2 flex-1 overflow-y-auto min-h-0">
              <div className="mb-2">
                <h3 className="text-xs font-medium text-gray-600 mb-2">Sub-tasks</h3>
                {subTasks && subTasks.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {subTasks.map((st) => (
                      <div key={st.id} className="flex items-center justify-between p-2 neumorphic-dark rounded text-xs">
                        <span className="text-gray-700 truncate flex-1">{st.title}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubTask(st.id)}
                          className="ml-2 p-0.5 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showSubTaskForm ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={subTaskTitle}
                      onChange={(e) => setSubTaskTitle(e.target.value)}
                      placeholder="Sub-task title"
                      className="w-full input-neumorphic text-xs"
                      autoFocus
                    />
                    <select
                      value={subTaskPriority}
                      onChange={(e) => setSubTaskPriority(e.target.value as TaskPriority)}
                      className="w-full select-neumorphic text-xs"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={!subTaskTitle.trim()}
                        onClick={handleCreateSubTask}
                        className="flex-1 py-1 px-2 btn-neumorphic text-xs disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubTaskForm(false);
                          setSubTaskTitle('');
                        }}
                        className="px-2 py-1 btn-neumorphic text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubTaskForm(true)}
                    className="w-full py-1 px-2 text-xs text-gray-600 hover:text-gray-800 neumorphic-dark transition-colors"
                  >
                    + Add Sub-task
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-2 p-4 divider-neumorphic flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-neumorphic text-sm"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>

            {!isNew && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-3 py-2 neumorphic-dark text-red-500 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 btn-neumorphic text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
