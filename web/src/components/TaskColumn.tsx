import type { Task, TaskStatus } from '@d-kanban/shared';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export default function TaskColumn({ status, title, tasks, onTaskClick, onStatusChange }: TaskColumnProps) {
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await onStatusChange(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-slate-800 rounded-lg border border-slate-700 p-4 min-h-96"
    >
      <h2 className="text-lg font-semibold text-slate-50 mb-4">{title}</h2>
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
