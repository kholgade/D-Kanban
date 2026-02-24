import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler.js';
import { AppError } from '../middleware/error-handler.js';
import { boardStorageService } from '../services/board-storage-service.js';
import { taskService } from '../services/task-service.js';
import { DEFAULT_COLUMNS } from '@d-kanban/shared';

const router = Router();

const saveBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  columns: z.array(z.object({
    status: z.enum(['todo', 'in-progress', 'blocked', 'done']),
    title: z.string(),
    order: z.number(),
  })).optional(),
});

const importBoardSchema = z.object({
  name: z.string().min(1).max(100),
  json: z.string(),
});

// GET /boards - List all boards
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const boards = await boardStorageService.listBoards();
    res.json({ success: true, data: boards });
  })
);

// GET /boards/:name - Get board metadata
router.get(
  '/:name',
  asyncHandler(async (req, res) => {
    const name = typeof req.params.name === 'string' ? req.params.name : req.params.name[0];
    const board = await boardStorageService.loadBoard(name);

    if (!board) {
      throw new AppError(404, `Board "${name}" not found`);
    }

    res.json({ success: true, data: board });
  })
);

// POST /boards/save - Save current board
router.post(
  '/save/current',
  asyncHandler(async (req, res) => {
    const { name, description, columns } = saveBoardSchema.parse(req.body);

    const tasks = taskService.getAllTasks();
    const board = await boardStorageService.saveBoard(name, tasks, description, columns || DEFAULT_COLUMNS);

    res.json({ success: true, data: board });
  })
);

// POST /boards/load - Load board into memory
router.post(
  '/load/:name',
  asyncHandler(async (req, res) => {
    const name = typeof req.params.name === 'string' ? req.params.name : req.params.name[0];
    const board = await boardStorageService.loadBoard(name);

    if (!board) {
      throw new AppError(404, `Board "${name}" not found`);
    }

    // Clear current tasks and load board tasks
    taskService.clear();
    board.tasks.forEach((task) => {
      taskService.updateTask(task.id, task);
    });

    res.json({ success: true, data: board });
  })
);

// POST /boards/import - Import board from JSON
router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const { name, json } = importBoardSchema.parse(req.body);

    const board = await boardStorageService.importBoard(name, json);
    res.status(201).json({ success: true, data: board });
  })
);

// GET /boards/export/:name - Export board as JSON
router.get(
  '/export/:name',
  asyncHandler(async (req, res) => {
    const name = typeof req.params.name === 'string' ? req.params.name : req.params.name[0];
    const json = await boardStorageService.exportBoard(name);

    res.set('Content-Type', 'application/json');
    res.set('Content-Disposition', `attachment; filename="${name}.json"`);
    res.send(json);
  })
);

// DELETE /boards/:name - Delete board
router.delete(
  '/:name',
  asyncHandler(async (req, res) => {
    const name = typeof req.params.name === 'string' ? req.params.name : req.params.name[0];
    const deleted = await boardStorageService.deleteBoard(name);

    if (!deleted) {
      throw new AppError(404, `Board "${name}" not found`);
    }

    res.json({ success: true, data: { name } });
  })
);

export default router;
