import SidebarSection from './SidebarSection';
import type { Task, Column } from '@d-kanban/shared';

interface TaskStatsProps {
  tasks: Task[];
  columns: Column[];
}

export default function TaskStats({ tasks, columns }: TaskStatsProps) {
  const stats = columns.map((col) => ({
    status: col.status,
    title: col.title,
    count: tasks.filter((t) => t.status === col.status && !t.parentTaskId).length,
  }));

  const totalTasks = tasks.filter((t) => !t.parentTaskId).length;
  const completedTasks = stats.find((s) => s.status === 'done')?.count || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <SidebarSection title="Stats" defaultOpen={false}>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div
            key={stat.status}
            className="flex justify-between items-center text-xs"
          >
            <span className="text-slate-400">{stat.title}</span>
            <span className="font-semibold text-slate-200">{stat.count}</span>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="font-semibold text-slate-200">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-violet-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700 text-xs text-slate-400">
          <div>{completedTasks} / {totalTasks} completed</div>
        </div>
      </div>
    </SidebarSection>
  );
}
