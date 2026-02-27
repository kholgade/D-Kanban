import { createLogger } from '../lib/logger.js';
import type { Task, TaskStatus, TaskPriority } from '@d-kanban/shared';
import { nanoid } from 'nanoid';

const log = createLogger('task-service');

interface TaskStore {
  [key: string]: Task;
}

class TaskService {
  private tasks: TaskStore = {};

  createTask(title: string, description = '', priority: TaskPriority = 'low', parentTaskId?: string): Task {
    // Get the max order for tasks in 'todo' status or parent's sub-tasks
    let tasksForOrder: Task[];
    if (parentTaskId) {
      // For sub-tasks, calculate order among parent's sub-tasks
      tasksForOrder = Object.values(this.tasks).filter((t) => t.parentTaskId === parentTaskId);
    } else {
      // For root tasks in 'todo' status
      tasksForOrder = Object.values(this.tasks).filter((t) => t.status === 'todo' && !t.parentTaskId);
    }
    const maxOrder = Math.max(...tasksForOrder.map((t) => t.order || 0), -1);

    const task: Task = {
      id: nanoid(),
      title,
      description,
      content: '',
      status: parentTaskId ? 'todo' : 'todo',
      priority,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentTaskId,
    };
    this.tasks[task.id] = task;
    log.info({ taskId: task.id, parentTaskId }, 'Task created');
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

  getSubTasks(parentId: string): Task[] {
    return Object.values(this.tasks)
      .filter((t) => t.parentTaskId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
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
      // Cascade delete sub-tasks
      const subTasks = this.getSubTasks(id);
      subTasks.forEach((st) => {
        delete this.tasks[st.id];
      });

      delete this.tasks[id];
      log.info({ taskId: id, subTaskCount: subTasks.length }, 'Task deleted with sub-tasks');
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

    orderedIds.forEach((id, index) => {
      const task = this.tasks[id];
      if (task) {
        task.order = index;
      }
    });

    log.info({ status, count: orderedIds.length }, 'Tasks reordered');
  }

  clear(): void {
    this.tasks = {};
    log.info('All tasks cleared');
  }
}

export const taskService = new TaskService();
