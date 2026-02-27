import SidebarSection from './SidebarSection';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ViewToggleProps {
  currentView: 'kanban' | 'list' | 'timeline';
  onViewChange: (view: 'kanban' | 'list' | 'timeline') => void;
}

const views = [
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: List },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
] as const;

export default function ViewToggle({
  currentView,
  onViewChange,
}: ViewToggleProps) {
  const [hoveredView, setHoveredView] = useState<string | null>(null);

  return (
    <SidebarSection title="Views" defaultOpen={true}>
      <div className="flex gap-2">
        {views.map(({ id, label, icon: Icon }) => (
          <div key={id} className="relative flex-1">
            <button
              onClick={() => onViewChange(id)}
              onMouseEnter={() => setHoveredView(id)}
              onMouseLeave={() => setHoveredView(null)}
              className={`w-full p-2 neumorphic-dark flex items-center justify-center transition-all ${
                currentView === id
                  ? 'neumorphic-dark-pressed text-gray-800 font-bold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon size={18} />
            </button>
            {hoveredView === id && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 neumorphic-dark text-gray-800 text-xs rounded whitespace-nowrap pointer-events-none z-50 font-medium">
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
    </SidebarSection>
  );
}
