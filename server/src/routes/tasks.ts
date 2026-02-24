import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler.js';
import { AppError } from '../middleware/error-handler.js';
import { taskService } from '../services/task-service.js';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  priority: z.enum(['urgent', 'high', 'important', 'low']).optional().default('low'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['urgent', 'high', 'important', 'low']).optional(),
});

// GET /tasks - Get all tasks
router.get(
  '/',
  asyncHandler((_req, res) => {
    const tasks = taskService.getAllTasks();
    res.json({ success: true, data: tasks });
  })
);

// GET /tasks/:id - Get single task
router.get(
  '/:id',
  asyncHandler((req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const task = taskService.getTask(id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }
    res.json({ success: true, data: task });
  })
);

// POST /tasks - Create task
router.post(
  '/',
  asyncHandler((req, res) => {
    const { title, description, priority } = createTaskSchema.parse(req.body);
    const task = taskService.createTask(title, description, priority);
    res.status(201).json({ success: true, data: task });
  })
);

// PUT /tasks/:id - Update task
router.put(
  '/:id',
  asyncHandler((req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const updates = updateTaskSchema.parse(req.body);
    const task = taskService.updateTask(id, updates);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json({ success: true, data: task });
  })
);

// DELETE /tasks/:id - Delete task
router.delete(
  '/:id',
  asyncHandler((req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const deleted = taskService.deleteTask(id);
    if (!deleted) {
      throw new AppError(404, 'Task not found');
    }

    res.json({ success: true, data: { id } });
  })
);

export default router;
