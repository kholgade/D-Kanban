import { useTasks } from './hooks/useTasks';
import KanbanBoard from './pages/KanbanBoard';

export default function App() {
  // Use a dummy token for now (auth disabled)
  const dummyToken = 'dummy-token';
  const tasks = useTasks(dummyToken);

  return <KanbanBoard tasks={tasks} />;
}
