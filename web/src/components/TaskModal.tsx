import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskPriority } from '@d-kanban/shared';

interface TaskModalProps {
  task?: Task;
  isNew?: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-900 text-red-100' },
  { value: 'high', label: 'High', color: 'bg-yellow-900 text-yellow-100' },
  { value: 'important', label: 'Important', color: 'bg-cyan-900 text-cyan-100' },
  { value: 'low', label: 'Low', color: 'bg-gray-700 text-gray-200' },
];

export default function TaskModal({ task, isNew, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'low');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate({ title, description, priority });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-violet-400">
            {isNew ? 'New Task' : 'Edit Task'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none h-24"
              placeholder="Task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    priority === p.value
                      ? `${p.color} ring-2 ring-violet-400`
                      : `${p.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>

            {!isNew && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-900 text-red-100 font-medium rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
