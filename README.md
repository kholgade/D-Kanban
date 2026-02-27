# D-Kanban

A local-first task management platform with real-time synchronization, featuring Kanban board drag-and-drop, dynamic column management, and multiple view modes.

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9.15+

### Installation & Running
```bash
# Install dependencies
pnpm install

# Run dev server and frontend concurrently
pnpm dev

# Or run separately
pnpm dev:server  # Backend on port 3001
pnpm dev:web     # Frontend on port 3000
```

**Default Login**: username `admin`, password `admin123`

## Features

- **Kanban Board**: Drag-and-drop tasks across columns with real-time sync
- **Multiple Views**: Kanban (default), List, and Timeline views
- **Dynamic Columns**: Create, delete, and reorder columns with custom colors
- **Task Management**: Full CRUD with priorities, descriptions, and subtasks
- **Board Persistence**: Save, load, export, and import boards to JSON
- **Real-time Updates**: WebSocket-based synchronization across clients
- **JWT Authentication**: Secure token-based auth flow

## Architecture

Monorepo with three packages:
- **shared**: Type definitions and API utilities
- **server**: Express.js backend with WebSocket support
- **web**: React 19 frontend with Vite

## Common Commands

```bash
# Development
pnpm dev              # Run all concurrently
pnpm dev:server      # Backend only
pnpm dev:web         # Frontend only

# Building & Quality
pnpm build            # Build all packages
pnpm lint             # ESLint check
pnpm lint:fix         # Auto-fix lint issues
pnpm typecheck        # TypeScript validation
pnpm test             # Run Vitest tests
pnpm clean            # Remove dist and node_modules

# Single Package
pnpm --filter @d-kanban/server build
pnpm --filter @d-kanban/web dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (returns JWT)

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Boards
- `POST /api/v1/boards/save` - Save board state
- `GET /api/v1/boards` - List saved boards
- `GET /api/v1/boards/:name` - Load board
- `DELETE /api/v1/boards/:name` - Delete board

## WebSocket Events

- **Client→Server**: `{ type: 'subscribe' }`
- **Server→All**: `{ type: 'task:created|updated|deleted', data: Task }`
- **Server→All**: `{ type: 'board:sync', data: { tasks, columns } }`

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, @dnd-kit
- **Backend**: Express.js 5, WebSocket (ws), Zod validation
- **Testing**: Vitest
- **Build**: pnpm workspaces

## Project Structure

```
shared/         # Type definitions
server/         # Express backend
web/            # React frontend
CLAUDE.md       # Development guidelines
```

