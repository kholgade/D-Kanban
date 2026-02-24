# D-Kanban Product Requirements Document

## Executive Summary

D-Kanban is a lightweight, local-first task management platform designed for autonomous AI agent orchestration and human task coordination. Built as a modern monorepo with React 19 frontend, Express.js backend, and real-time WebSocket communication, it provides a Kanban board interface with drag-and-drop functionality, real-time synchronization, and JWT-based authentication.

## Product Vision

Enable teams and AI agents to manage tasks collaboratively with:
- Intuitive visual task management via Kanban board
- Real-time synchronization across multiple clients
- Simple yet powerful REST API
- Authentication and session management
- Clean, modern user interface

## Core Features

### 1. Kanban Board Interface
- **Four Task Columns**: To Do, In Progress, Blocked, Done
- **Drag-and-Drop**: Move tasks between columns with mouse drag
- **Real-time Updates**: All connected clients see changes instantly via WebSocket
- **Task Cards**: Display title, description, priority level
- **Visual Status**: Color-coded columns for quick status recognition

### 2. Task Management
- **Create Tasks**: Add new tasks with title and description
- **Edit Tasks**: Update task details inline or via modal
- **Delete Tasks**: Remove completed or obsolete tasks
- **Task Metadata**:
  - ID (auto-generated)
  - Title (required)
  - Description (optional)
  - Status (todo, in-progress, blocked, done)
  - Priority (low, medium, high)
  - Created & Updated timestamps
  - Assignees (extensible for future use)
  - Tags (extensible for future use)

### 3. Real-time Synchronization
- **WebSocket Connection**: Persistent connection to server for live updates
- **Broadcast Updates**: All task changes broadcast to connected clients
- **Connection Status**: Visual indicator of connection state
- **Automatic Reconnection**: Handles disconnections gracefully
- **Event Types**:
  - task:created
  - task:updated
  - task:deleted
  - board:sync
  - connection:status

### 4. Authentication & Security
- **JWT Authentication**: Token-based session management
- **Login/Logout**: Username/password authentication
- **Protected Routes**: All API endpoints require valid JWT token
- **Authorization**: Role-based access control (admin, user)
- **Token Expiry**: 7-day token validity
- **Default Demo Account**: admin / admin123

### 5. REST API (v1)

#### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

#### Task Endpoints
- `GET /api/v1/tasks` - Retrieve all tasks
- `GET /api/v1/tasks/:id` - Retrieve single task
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

#### Response Format
```json
{
  "success": boolean,
  "data": any,
  "error": string (optional),
  "meta": object (optional)
}
```

### 6. Frontend Features
- **React 19**: Latest React with automatic batching
- **Vite**: Fast build tool with HMR
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-friendly interface
- **Context Hooks**: useAuth, useTasks for state management
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during async operations

### 7. Backend Features
- **Express.js v5**: Modern Node.js framework
- **WebSocket Server**: Real-time bidirectional communication
- **In-Memory Storage**: Fast task storage
- **Error Handling**: Standardized error responses
- **Async/Await**: Async request handlers with error catching
- **CORS**: Cross-origin request support
- **Compression**: Response compression for performance
- **Security Headers**: Helmet.js for HTTP security
- **Structured Logging**: Pino logger with pretty-printing

### 8. Monorepo Architecture
- **pnpm Workspaces**: Three independent packages
  - `shared` - Shared types and utilities (TypeScript)
  - `server` - Express backend (Node.js)
  - `web` - React frontend (Browser)
- **Unified TypeScript**: Single tsconfig hierarchy
- **Shared Types**: Consistent types across frontend/backend
- **Concurrent Development**: `pnpm dev` runs both services

## Technical Stack

### Frontend
- React 19.2.4
- Vite 6.0
- TypeScript 5.7
- Tailwind CSS 3.4
- @dnd-kit (drag-and-drop)
- @tanstack/react-query (data fetching)
- @radix-ui (accessible components)

### Backend
- Node.js 22+
- Express.js 5.2
- TypeScript 5.7
- WebSocket (ws 8.18)
- JWT (jsonwebtoken 9.0)
- Pino (logging)
- Zod (validation)

### Package Manager
- pnpm 9.15.4 (monorepo orchestration)

## Key Highlights

### 1. Real-time Collaboration
- Instant task updates across all connected users
- No page refresh needed
- Live connection status indicator
- Automatic WebSocket reconnection

### 2. Developer Experience
- Full TypeScript support with strict mode
- Shared type definitions prevent frontend/backend mismatch
- Easy local development with `pnpm dev`
- Clean, modular code structure
- ESLint + Prettier for code quality

### 3. Performance
- Code splitting via React lazy loading
- Vite's fast build process
- Compression for API responses
- In-memory task storage (extensible to persistent storage)
- Efficient WebSocket message broadcasting

### 4. Security
- JWT token-based authentication
- HTTP security headers (Helmet.js)
- CORS configuration
- Input validation with Zod schemas
- Password hashing ready (extensible)

### 5. Extensibility
- Modular service architecture (TaskService, BroadcastService)
- Plugin-ready middleware system
- Type-safe shared interfaces
- Clear separation of concerns

## User Workflows

### Workflow 1: New User Login
1. User visits application
2. Presented with login form (demo: admin/admin123)
3. Enter credentials and click Login
4. JWT token stored in localStorage
5. Redirected to Kanban board

### Workflow 2: Create & Manage Task
1. Click "+ New Task" button
2. Enter task title and description
3. Submit to create
4. Task appears in "To Do" column
5. Drag task to "In Progress" when starting
6. Click task to view/edit details
7. Drag to "Done" when complete
8. Delete if needed

### Workflow 3: Real-time Collaboration
1. User A moves task to "In Progress"
2. User B immediately sees change (WebSocket broadcast)
3. Both can edit same task without conflicts
4. All changes propagate in real-time

## Success Metrics

- **Performance**: API response time < 100ms
- **Reliability**: 99% WebSocket connection uptime
- **UX**: Task operations complete in < 1s
- **Build Time**: < 5 seconds for full build
- **Type Safety**: 100% TypeScript strict mode compliance

## Future Enhancements

1. **Persistent Storage**: File-based or database storage
2. **Filtering & Sorting**: Advanced task queries
3. **Comments & Activity**: Task discussions
4. **Attachments**: File uploads
5. **Git Integration**: Branch/commit tracking
6. **Analytics**: Work pattern insights
7. **Notifications**: Email/push alerts
8. **Custom Fields**: Extensible task metadata
9. **Templates**: Predefined task workflows
10. **Multi-user Permissions**: Fine-grained access control

## Deployment

### Local Development
```bash
pnpm install
pnpm dev
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Production Build
```bash
pnpm build
# Frontend: web/dist/
# Backend: server/dist/
```

### Environment Variables
- `NODE_ENV`: development or production
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Token signing key
- `LOG_LEVEL`: Logger level (info, debug, warn, error)
- `CORS_ORIGIN`: Allowed origins

## Constraints & Assumptions

1. **Single Server Instance**: Current implementation uses in-memory storage
2. **Local Development Focus**: Optimized for local/team workflows
3. **No Persistence Layer**: Tasks lost on server restart (by design)
4. **Authentication Simplified**: In-memory user store (extensible)
5. **Monorepo Size**: Lightweight packages for quick startup

## Definition of Done

✅ All packages build clean with zero TypeScript errors
✅ REST API fully functional with proper error handling
✅ WebSocket real-time synchronization working
✅ Authentication flow complete
✅ Kanban board UI responsive and intuitive
✅ Drag-and-drop functionality working smoothly
✅ README with setup instructions present
