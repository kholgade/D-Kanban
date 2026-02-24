import { createLogger } from '../lib/logger.js';
import type { Task, TaskStatus, TaskPriority } from '@d-kanban/shared';
import { nanoid } from 'nanoid';

const log = createLogger('task-service');

interface TaskStore {
  [key: string]: Task;
}

class TaskService {
  private tasks: TaskStore = {};

  createTask(title: string, description = '', priority: TaskPriority = 'low'): Task {
    const task: Task = {
      id: nanoid(),
      title,
      description,
      content: '',
      status: 'todo',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks[task.id] = task;
    log.info({ taskId: task.id }, 'Task created');
    return task;
  }

  getTask(id: string): Task | null {
    return this.tasks[id] || null;
  }

  getAllTasks(): Task[] {
    return Object.values(this.tasks);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return Object.values(this.tasks).filter((t) => t.status === status);
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const task = this.tasks[id];
    if (!task) return null;

    const updated: Task = {
      ...task,
      ...updates,
      id: task.id, // Prevent ID change
      createdAt: task.createdAt, // Prevent creation date change
      updatedAt: new Date().toISOString(),
    };

    this.tasks[id] = updated;
    log.info({ taskId: id }, 'Task updated');
    return updated;
  }

  deleteTask(id: string): boolean {
    if (this.tasks[id]) {
      delete this.tasks[id];
      log.info({ taskId: id }, 'Task deleted');
      return true;
    }
    return false;
  }

  reorderTasks(status: TaskStatus, orderedIds: string[]): void {
    const tasksInStatus = this.getTasksByStatus(status);
    const validIds = new Set(tasksInStatus.map((t) => t.id));

    if (!orderedIds.every((id) => validIds.has(id))) {
      throw new Error('Invalid task IDs for reordering');
    }

    log.info({ status, count: orderedIds.length }, 'Tasks reordered');
  }

  clear(): void {
    this.tasks = {};
    log.info('All tasks cleared');
  }
}

export const taskService = new TaskService();
