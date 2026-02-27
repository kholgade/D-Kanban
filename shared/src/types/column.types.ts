export type ColumnStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Column {
  status: ColumnStatus;
  title: string;
  order: number;
  color?: string;
}

export const DEFAULT_COLUMNS: Column[] = [
  { status: 'todo', title: 'To Do', order: 0, color: 'slate' },
  { status: 'in-progress', title: 'In Progress', order: 1, color: 'blue' },
  { status: 'blocked', title: 'Blocked', order: 2, color: 'red' },
  { status: 'done', title: 'Done', order: 3, color: 'green' },
];
