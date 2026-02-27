import { Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-300 shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">D-Kanban</h1>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 neumorphic-dark text-gray-800 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">{user.username}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm btn-neumorphic"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
