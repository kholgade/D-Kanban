import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../lib/logger.js';
import type { Task, Column } from '@d-kanban/shared';
import { DEFAULT_COLUMNS as DEFAULT_COLS } from '@d-kanban/shared';

interface FileError {
  code?: string;
}

const log = createLogger('board-storage');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const BOARDS_DIR = path.join(DATA_DIR, 'boards');

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

class BoardStorageService {
  async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(BOARDS_DIR, { recursive: true });
      log.info('Ensured board storage directories exist');
    } catch (err) {
      log.error({ err }, 'Failed to create directories');
      throw err;
    }
  }

  private getBoardPath(boardName: string): string {
    return path.join(BOARDS_DIR, `${boardName}.json`);
  }

  async saveBoard(boardName: string, tasks: Task[], description?: string, columns: Column[] = DEFAULT_COLS): Promise<Board> {
    await this.ensureDirectories();

    const board: Board = {
      name: boardName,
      description,
      tasks,
      columns,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const boardPath = this.getBoardPath(boardName);

    try {
      await fs.writeFile(boardPath, JSON.stringify(board, null, 2), 'utf-8');
      log.info({ boardName, taskCount: tasks.length, columnCount: columns.length }, 'Board saved');
      return board;
    } catch (err) {
      log.error({ err, boardName }, 'Failed to save board');
      throw err;
    }
  }

  async loadBoard(boardName: string): Promise<Board | null> {
    const boardPath = this.getBoardPath(boardName);

    try {
      const content = await fs.readFile(boardPath, 'utf-8');
      const board: Board = JSON.parse(content);
      log.info({ boardName, taskCount: board.tasks.length }, 'Board loaded');
      return board;
    } catch (err) {
      const nodeErr = err as FileError;
      if (nodeErr.code === 'ENOENT') {
        log.warn({ boardName }, 'Board file not found');
        return null;
      }
      log.error({ err, boardName }, 'Failed to load board');
      throw err;
    }
  }

  async listBoards(): Promise<BoardMetadata[]> {
    try {
      await this.ensureDirectories();
      const files = await fs.readdir(BOARDS_DIR);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const boards: BoardMetadata[] = [];

      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(path.join(BOARDS_DIR, file), 'utf-8');
          const board: Board = JSON.parse(content);
          boards.push({
            name: board.name,
            description: board.description,
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
            taskCount: board.tasks.length,
          });
        } catch {
          log.warn({ file }, 'Failed to read board metadata');
        }
      }

      return boards;
    } catch (err) {
      log.error({ err }, 'Failed to list boards');
      throw err;
    }
  }

  async deleteBoard(boardName: string): Promise<boolean> {
    const boardPath = this.getBoardPath(boardName);

    try {
      await fs.unlink(boardPath);
      log.info({ boardName }, 'Board deleted');
      return true;
    } catch (err) {
      const nodeErr = err as FileError;
      if (nodeErr.code === 'ENOENT') {
        return false;
      }
      log.error({ err, boardName }, 'Failed to delete board');
      throw err;
    }
  }

  async exportBoard(boardName: string): Promise<string> {
    const board = await this.loadBoard(boardName);
    if (!board) {
      throw new Error(`Board "${boardName}" not found`);
    }
    return JSON.stringify(board, null, 2);
  }

  async importBoard(boardName: string, jsonContent: string): Promise<Board> {
    try {
      const board: Board = JSON.parse(jsonContent);
      board.name = boardName;
      board.createdAt = new Date().toISOString();
      board.updatedAt = new Date().toISOString();
      board.columns = board.columns || DEFAULT_COLS;

      await this.saveBoard(boardName, board.tasks, board.description, board.columns);
      return board;
    } catch (err) {
      log.error({ err }, 'Failed to import board');
      throw new Error('Invalid board JSON format');
    }
  }
}

export const boardStorageService = new BoardStorageService();
