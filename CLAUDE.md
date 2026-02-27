# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D-Kanban is a local-first task management platform with real-time synchronization. It's a monorepo with three packages: **shared** (types), **server** (Express.js backend), and **web** (React 19 frontend). Features include JWT authentication, WebSocket-based real-time updates, Kanban board drag-and-drop, and board management (save/load/import/export).

## Development Stack

- **Runtime**: Node.js 22+, pnpm 9.15+
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS, @dnd-kit
- **Backend**: Express.js 5, WebSocket (ws), Pino logger, Zod validation
- **Package Manager**: pnpm with workspaces
- **Testing**: Vitest

## Common Commands

### Development
- `pnpm dev` - Run server and web concurrently (server:3001, web:3000)
- `pnpm dev:server` - Backend only
- `pnpm dev:web` - Frontend only

### Building & Quality
- `pnpm build` - Build all packages
- `pnpm lint` - Run ESLint on entire codebase
- `pnpm lint:fix` - Auto-fix lint issues
- `pnpm typecheck` - TypeScript type checking
- `pnpm test` - Run Vitest tests
- `pnpm clean` - Remove dist folders and node_modules

### Single Package Commands
Use `pnpm --filter [package-name]` to run commands for specific packages:
- `pnpm --filter @d-kanban/server build`
- `pnpm --filter @d-kanban/web dev`
- `pnpm --filter @d-kanban/shared typecheck`

## Architecture

### Package Structure
```
shared/          # Type definitions and utilities
├── src/types/
│   ├── task.types.ts      # Task, TaskStatus, TaskPriority, Column
│   ├── api.types.ts       # API responses
│   ├── auth.types.ts      # Auth payloads
│   ├── websocket.types.ts # WebSocket message types
│   └── column.types.ts    # Dynamic columns
└── utils/api-client.ts    # Shared API utilities

server/          # Express backend
├── src/
│   ├── index.ts           # App entry, middleware setup, routes
│   ├── routes/
│   │   ├── auth.ts        # Login, register endpoints
│   │   ├── tasks.ts       # Task CRUD endpoints
│   │   └── boards.ts      # Board management (save/load/export)
│   ├── services/
│   │   ├── task-service.ts         # Task CRUD logic, in-memory store
│   │   ├── broadcast-service.ts    # WebSocket client management
│   │   └── board-storage-service.ts # Board persistence (JSON files)
│   ├── middleware/
│   │   ├── auth.ts        # JWT verification, user attachment
│   │   ├── async-handler.ts # Async error wrapping
│   │   └── error-handler.ts # Standardized error responses
│   └── lib/logger.ts      # Pino logger setup

web/             # React frontend
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx    # Login form
│   │   └── KanbanBoard.tsx  # Main board view
│   ├── components/
│   │   ├── Header.tsx       # Top navigation
│   │   ├── TaskColumn.tsx   # Column container (dnd-kit enabled)
│   │   ├── TaskCard.tsx     # Individual task card
│   │   ├── TaskRow.tsx      # Task row in table-like layout
│   │   ├── TaskModal.tsx    # Task edit modal
│   │   ├── BoardMenu.tsx    # Board management menu
│   │   └── Toast.tsx        # Toast notifications
│   ├── hooks/
│   │   ├── useAuth.ts       # Auth context and login/logout
│   │   ├── useTasks.ts      # Task CRUD and WebSocket sync
│   │   ├── useColumns.ts    # Dynamic column state and reordering
│   │   └── useBoards.ts     # Board load/save operations
│   ├── App.tsx              # Route setup, context providers
│   └── main.tsx             # Entry point
```

### Key Architectural Patterns

1. **In-Memory Task Storage**: TaskService maintains tasks in a simple object store (persists until server restart). Board state can be saved to JSON files via board-storage-service.

2. **Service Separation**: TaskService (task logic) and BroadcastService (WebSocket management) are independent. Routes delegate business logic to services.

3. **WebSocket Broadcasting**: BroadcastService maintains a Set of connected WebSocket clients. Any task change triggers a broadcast message to all subscribers. Clients reconnect on disconnect.

4. **JWT + Request Context**: Auth middleware verifies JWT tokens and attaches user info to `req.user`. Protected routes check for valid tokens.

5. **Error Handling**: Middleware wraps async handlers. Errors are caught and sent as standardized responses (`{ success: false, error: string }`).

6. **Shared Types**: All type definitions live in `/shared` to ensure consistency between frontend and backend. Frontend imports from `@d-kanban/shared`.

7. **Real-time Sync**: useTasks hook maintains a WebSocket connection and synchronizes tasks. Local mutations update state immediately; WebSocket messages handle remote updates.

8. **Dynamic Columns**: Column structure is NOT hardcoded. Columns are stored as data. useColumns hook manages column state, and column reordering persists via the boards API.

9. **Board Persistence**: board-storage-service persists board state (columns + task order) to JSON files in `server/data/boards/`. Boards are loaded/saved via API endpoints.

## Authentication & API

### Default Credentials
- Username: `admin`
- Password: `admin123`

### API Response Format
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Errors:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Key Endpoints
- `POST /api/v1/auth/login` - Returns JWT token
- `GET /api/v1/tasks` - Returns all tasks
- `POST /api/v1/tasks` - Create task (body: `{ title, description, priority }`)
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `POST /api/v1/boards/save` - Save current board state (body: `{ name, tasks, columns }`)
- `GET /api/v1/boards/:name` - Load board (returns tasks + columns)
- `GET /api/v1/boards` - List saved boards
- `DELETE /api/v1/boards/:name` - Delete saved board

### WebSocket Events
- Client → Server: `{ type: 'subscribe' }` to connect
- Server → All: `{ type: 'task:created|updated|deleted', data: Task }`
- Server → All: `{ type: 'board:sync', data: { tasks, columns } }`

## Development Notes

### Adding a New Feature
1. Define types in `shared/src/types/`.
2. Add backend logic in `server/src/services/`.
3. Create route in `server/src/routes/`.
4. Build frontend component in `web/src/components/`.
5. Use hooks in `web/src/hooks/` for API calls and state management.
6. Ensure WebSocket broadcasts are triggered in services where necessary.

### Working with Tasks
- Tasks have `id`, `title`, `description`, `status`, `priority`, `order`, `createdAt`, `updatedAt`, and optional `parentTaskId` for subtasks.
- TaskService enforces order sequencing (order is 0-indexed within each status or parent context).
- Tasks are mutable; updates trigger WebSocket broadcasts.

### Working with Columns
- Columns are dynamic entities defined by `id`, `name`, `color`, and `order`.
- Default columns: "to-do", "in-progress", "blocked", "done".
- Column reordering updates the board and broadcasts to clients.
- New columns can be added; tasks map to columns by task.status matching column names (normalized).

### WebSocket & Real-time
- `useTasks` hook opens a WebSocket on mount and maintains a queue of outgoing messages.
- Incoming messages update local state.
- Connection status is tracked; UI shows connection indicator.
- Reconnection is automatic if the connection drops.

### Testing
- Tests use Vitest. Run `pnpm test`.
- Each package has its own test suite.
- Focus on critical paths: auth flow, task CRUD, WebSocket sync.

### Debugging
- **Server logs**: Pino logger with `pino-pretty` for readability. Set `LOG_LEVEL=debug` for verbose output.
- **Frontend**: React DevTools and browser console. Check network tab for WebSocket messages.
- **TypeScript errors**: Run `pnpm typecheck` to catch type issues early.

## File Modifications History (Recent Changes)
- Board management features added (save, load, delete, import/export)
- Dynamic column reordering implemented
- New TaskRow component for alternative task display
- Board storage service for JSON persistence
