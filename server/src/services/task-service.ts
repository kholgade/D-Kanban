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
    // Get the max order for tasks in 'todo' status
    const todoTasks = Object.values(this.tasks).filter((t) => t.status === 'todo');
    const maxOrder = Math.max(...todoTasks.map((t) => t.order || 0), -1);

    const task: Task = {
      id: nanoid(),
      title,
      description,
      content: '',
      status: 'todo',
      priority,
      order: maxOrder + 1,
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

    // If task doesn't exist, create it with the provided data
    if (!task) {
      const newTask: Task = {
        id,
        title: (updates.title as string) || 'Untitled',
        description: (updates.description as string) || '',
        content: '',
        status: (updates.status as TaskStatus) || 'todo',
        priority: (updates.priority as TaskPriority) || 'low',
        order: updates.order,
        createdAt: (updates.createdAt as string) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tasks[id] = newTask;
      log.info({ taskId: id }, 'Task created via update');
      return newTask;
    }

    // If status changed, update order to place it at the end of new status column
    let newUpdates = updates;
    if (updates.status && updates.status !== task.status) {
      const tasksInNewStatus = Object.values(this.tasks).filter(
        (t) => t.status === updates.status
      );
      const maxOrder = Math.max(...tasksInNewStatus.map((t) => t.order || 0), -1);
      newUpdates = { ...updates, order: maxOrder + 1 };
    }

    const updated: Task = {
      ...task,
      ...newUpdates,
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
