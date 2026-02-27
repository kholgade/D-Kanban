import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="divider-neumorphic">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-300/20 transition-colors text-sm font-semibold text-gray-800"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 text-gray-600 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-3 py-2 space-y-1 bg-gray-200/20">
          {children}
        </div>
      )}
    </div>
  );
}
