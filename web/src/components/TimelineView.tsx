import type { Task } from '@d-kanban/shared';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TimelineView({
  tasks,
  onTaskClick,
}: TimelineViewProps) {
  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const today = new Date();
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Get the effective date for a task (due date or scheduled date, fallback to creation date)
  const getTaskEffectiveDate = (task: Task): Date => {
    if (task.dueDate) {
      return new Date(task.dueDate);
    }
    if (task.scheduledDate) {
      return new Date(task.scheduledDate);
    }
    return new Date(task.createdAt);
  };

  // Check if a date matches (ignoring time)
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getTasksForDate = (date: Date) => {
    return rootTasks.filter((task) => {
      const taskEffectiveDate = getTaskEffectiveDate(task);
      return isSameDate(taskEffectiveDate, date);
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // Helper to determine if task has a due date
  const hasDueDate = (task: Task): boolean => {
    return !!(task.dueDate || task.scheduledDate);
  };

  // Get all tasks that have scheduled dates for the next 7 days
  const getTasksWithDueDate = (): Task[] => {
    return rootTasks.filter((task) => {
      if (!hasDueDate(task)) return false;
      const effectiveDate = getTaskEffectiveDate(task);
      return nextDays.some((d) => isSameDate(effectiveDate, d));
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4">
      <div className="space-y-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {nextDays.map((date) => {
            const isToday = date.toDateString() === today.toDateString();
            const isMutedWeekend = isWeekend(date);
            const tasksForDate = getTasksForDate(date);

            return (
              <div
                key={date.toISOString()}
                className={`rounded-3xl border overflow-hidden flex flex-col bg-white transition-all ${
                  isToday
                    ? 'border-blue-400 shadow-md'
                    : isMutedWeekend
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-300 shadow-sm'
                }`}
              >
                {/* Header */}
                <div
                  className={`px-3 py-2 font-semibold text-xs border-b ${
                    isToday
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-500">{formatDay(date)}</div>
                  <div className="font-bold">{formatDate(date)}</div>
                  {isToday && <div className="text-xs text-blue-600 font-medium">Today</div>}
                </div>

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-32">
                  {tasksForDate.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">No tasks</p>
                  ) : (
                    tasksForDate.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs truncate transition-colors font-medium ${
                          hasDueDate(task)
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="truncate">{task.title}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scheduled Section */}
        {getTasksWithDueDate().length > 0 && (
          <div className="rounded-3xl border border-gray-300 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              📅 Scheduled ({getTasksWithDueDate().length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {getTasksWithDueDate().map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs text-amber-800 font-medium transition-colors"
                >
                  {task.title} • {formatDate(getTaskEffectiveDate(task))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unscheduled Section */}
        {(() => {
          const unscheduledTasks = rootTasks.filter(
            (task) =>
              !hasDueDate(task) &&
              !nextDays.some((d) => isSameDate(new Date(task.createdAt), d))
          );
          return unscheduledTasks.length > 0 ? (
            <div className="rounded-3xl border border-gray-300 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Unscheduled ({unscheduledTasks.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {unscheduledTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs text-gray-800 font-medium transition-colors"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}
