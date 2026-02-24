import { useState, useCallback } from 'react';
import type { Column } from '@d-kanban/shared';
import { DEFAULT_COLUMNS } from '@d-kanban/shared';

export function useColumns() {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);

  const addColumn = useCallback((title: string) => {
    setColumns((prev) => {
      const newOrder = Math.max(...prev.map((c) => c.order), -1) + 1;
      const newStatus = `custom-${Date.now()}` as unknown as typeof DEFAULT_COLUMNS[0]['status'];
      const newColumn: Column = {
        status: newStatus,
        title,
        order: newOrder,
      };
      return [...prev, newColumn];
    });
  }, []);

  const removeColumn = useCallback((status: string, taskCount: number): boolean => {
    if (columns.length <= 1) {
      return false; // Cannot delete last column
    }
    if (taskCount > 0) {
      return false; // Cannot delete non-empty column
    }
    setColumns((prev) => prev.filter((c) => c.status !== status));
    return true;
  }, [columns.length]);

  const updateColumnTitle = useCallback((status: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.status === status ? { ...c, title: newTitle } : c))
    );
  }, []);

  const reorderColumns = useCallback((newColumns: Column[]) => {
    setColumns(newColumns);
  }, []);

  return {
    columns,
    setColumns,
    addColumn,
    removeColumn,
    updateColumnTitle,
    reorderColumns,
  };
}
