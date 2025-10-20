# Note Taker Convex Backend

This directory contains the Convex backend functions for the collaborative Note Taker application.

## 📁 File Structure

- **`schema.ts`** - Database schema definition (users, notes, logs)
- **`auth.ts`** - Demo authentication system with workspace support
- **`notes.ts`** - CRUD operations for notes with workspace-based permissions
- **`logs.ts`** - Activity logging and statistics
- **`ai.ts`** - OpenAI integration for AI-generated notes

## 🗄️ Database Schema

### Tables

1. **users**
   - `username` (string) - Unique username
   - `displayName` (string) - Display name
   - `workspace` (string) - Workspace identifier
   - `lastActive` (number) - Timestamp of last activity

2. **notes**
   - `userId` (string) - Author username
   - `workspace` (string) - Workspace identifier
   - `title` (string) - Note title
   - `content` (string) - Note content
   - `createdAt` (number) - Creation timestamp
   - `updatedAt` (number) - Last update timestamp

3. **logs**
   - `type` (union) - query | mutation | subscription | error
   - `operation` (string) - Function name
   - `userId` (optional string) - User who performed the action
   - `data` (any) - Additional log data
   - `timestamp` (number) - When the action occurred
   - `executionTime` (optional number) - Execution time in ms

## 🔐 Permission Model

- **Read Access**: All users can view notes from ALL workspaces
- **Write Access**: Users can only edit/delete notes from THEIR workspace

## 🚀 Features

- Real-time collaborative note-taking
- Workspace-based organization
- Activity logging and monitoring
- AI-powered note generation (OpenAI)
- Demo authentication system

## 📚 Key Functions

### Authentication (`auth.ts`)

- `loginDemoUser` - Login/create user with workspace
- `logoutUser` - Logout user
- `getCurrentUser` - Get user by username
- `getActiveUsers` - Get active users in a workspace

### Notes (`notes.ts`)

- `listNotes` - Get all notes (from all workspaces)
- `searchNotes` - Search notes across all workspaces
- `createNote` - Create a new note
- `updateNote` - Update note (workspace permission check)
- `deleteNote` - Delete note (workspace permission check)

### Logs (`logs.ts`)

- `addLog` - Add activity log entry
- `getLogs` - Get recent logs
- `getStats` - Get system statistics
- `clearLogs` - Clear all logs

### AI (`ai.ts`)

- `generateRandomNote` - Generate creative note using OpenAI

## 🛠️ Development

Push schema and functions to Convex:

```bash
npx convex dev
```

Open Convex Dashboard:

```bash
npx convex dashboard
```

## 📖 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Integration](https://docs.convex.dev/client/react)
