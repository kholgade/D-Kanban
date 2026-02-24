import { useState, useCallback } from 'react';
import type { Task, Column } from '@d-kanban/shared';

export interface Board {
  name: string;
  description?: string;
  tasks: Task[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardMetadata {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

export function useBoards() {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/boards');
      const data = (await response.json()) as { success: boolean; data: BoardMetadata[] };
      if (data.success) {
        setBoards(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list boards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBoard = useCallback(async (name: string, description?: string, columns?: Column[]) => {
    try {
      const response = await fetch('/api/v1/boards/save/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, columns }),
      });
      const data = (await response.json()) as { success: boolean; data: Board };
      if (data.success) {
        await listBoards();
        return data.data;
      }
      throw new Error('Failed to save board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save board';
      setError(message);
      throw err;
    }
  }, [listBoards]);

  const loadBoard = useCallback(async (name: string) => {
    try {
      const response = await fetch(`/api/v1/boards/load/${name}`, {
        method: 'POST',
      });
      const data = (await response.json()) as { success: boolean; data: Board };
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to load board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load board';
      setError(message);
      throw err;
    }
  }, []);

  const deleteBoard = useCallback(async (name: string) => {
    try {
      const response = await fetch(`/api/v1/boards/${name}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { success: boolean };
      if (data.success) {
        await listBoards();
        return true;
      }
      throw new Error('Failed to delete board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete board';
      setError(message);
      throw err;
    }
  }, [listBoards]);

  const exportBoard = useCallback(async (name: string) => {
    try {
      const response = await fetch(`/api/v1/boards/export/${name}`);
      if (response.ok) {
        const text = await response.text();
        return text;
      }
      throw new Error('Failed to export board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export board';
      setError(message);
      throw err;
    }
  }, []);

  const importBoard = useCallback(async (name: string, json: string) => {
    try {
      const response = await fetch('/api/v1/boards/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, json }),
      });
      const data = (await response.json()) as { success: boolean; data: Board };
      if (data.success) {
        await listBoards();
        return data.data;
      }
      throw new Error('Failed to import board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import board';
      setError(message);
      throw err;
    }
  }, [listBoards]);

  return {
    boards,
    isLoading,
    error,
    listBoards,
    saveBoard,
    loadBoard,
    deleteBoard,
    exportBoard,
    importBoard,
  };
}
