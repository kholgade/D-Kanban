import { useTasks } from './hooks/useTasks';
import KanbanBoard from './pages/KanbanBoard';

export default function App() {
  const tasks = useTasks();

  return <KanbanBoard tasks={tasks} />;
}
