export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'important' | 'low';

export interface TaskMetadata {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
}

export interface Task extends TaskMetadata {
  content: string;
  description?: string;
}

export interface TaskChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: string;
}
