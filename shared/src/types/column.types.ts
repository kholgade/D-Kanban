export type ColumnStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Column {
  status: ColumnStatus;
  title: string;
  order: number;
}

export const DEFAULT_COLUMNS: Column[] = [
  { status: 'todo', title: 'To Do', order: 0 },
  { status: 'in-progress', title: 'In Progress', order: 1 },
  { status: 'blocked', title: 'Blocked', order: 2 },
  { status: 'done', title: 'Done', order: 3 },
];
