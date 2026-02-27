import SidebarSection from './SidebarSection';

interface FilterPanelProps {
  filters: { priority?: string; status?: string };
  onFiltersChange: (filters: { priority?: string; status?: string }) => void;
}

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'important', label: 'Important' },
  { value: 'low', label: 'Low' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

export default function FilterPanel({
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? undefined : value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  return (
    <SidebarSection title="Filters" defaultOpen={false}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority || 'all'}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="w-full select-neumorphic text-xs"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full select-neumorphic text-xs"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(filters.priority || filters.status) && (
          <button
            onClick={() => onFiltersChange({ priority: undefined, status: undefined })}
            className="w-full px-2 py-1 text-xs btn-neumorphic rounded transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </SidebarSection>
  );
}
