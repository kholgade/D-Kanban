import SidebarSection from './SidebarSection';

const shortcuts = [
  { keys: '⌘N', action: 'New task' },
  { keys: '⌘S', action: 'Save board' },
  { keys: '⌘L', action: 'List view' },
  { keys: 'ESC', action: 'Close modal' },
];

export default function ShortcutsPanel() {
  return (
    <SidebarSection title="Shortcuts" defaultOpen={false}>
      <div className="space-y-1">
        {shortcuts.map((shortcut, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-slate-400">{shortcut.action}</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded border border-slate-700">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
    </SidebarSection>
  );
}
