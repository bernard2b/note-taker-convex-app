## Note Taker App (React + Convex + Tailwind)

A small, real‑time note taking app designed to practice Convex fundamentals end‑to‑end: schema design, queries, mutations, actions, indexes, scheduling, and a React client using `useQuery`, `useMutation`, and `useAction`.

### Purpose

- Practice building a real‑time app with Convex
- Explore a clean separation of concerns: auth, notes, logs, AI
- Learn how to structure Convex functions with validators and return types
- Try Convex Actions for safe external API calls (OpenAI)

### Stack

- React 19 + Vite 6 (frontend)
- Convex 1.x (backend, real‑time data + serverless functions)
- Tailwind CSS 4 (styling)
- TypeScript (strict types)
- OpenAI SDK (optional AI note generation)

---

## Quickstart

### Prerequisites

- Node.js 20+ and npm
- A Convex account (free dev project is fine)
- Optional: OpenAI API key for the AI generator

### 1) Install dependencies

```bash
npm install
```

### 2) Start the app (first run creates/links a Convex project)

```bash
npm run dev
```

This concurrently launches:

- Vite frontend (opens the browser automatically)
- Convex backend (dev server + dashboard)

If this is your first run, the Convex CLI will prompt you to sign in and create/link a project.

### 3) (Optional) Enable AI note generation

Set your OpenAI API key in Convex environment variables (used only in an Action):

```bash
npx convex env set OPENAI_API_KEY sk-...your-key...
```

### Other useful scripts

- `npm run build` – typecheck and build
- `npm run preview` – preview the built app
- `npm run lint` – TypeScript + ESLint

---

## What you can practice in Convex

### Data model (`convex/schema.ts`)

- `users` – demo auth users with `username`, `displayName`, `workspace`, `lastActive`
- `notes` – note documents with `userId`, `workspace`, `title`, `content`, timestamps
- `logs` – structured activity logs with type, operation, data, timestamp
- Indexes: `users.by_username`, `users.by_workspace`, `notes.by_user_id`, `notes.by_workspace`, `logs.by_timestamp`

### Queries – read operations

- `auth.getCurrentUser(username)` – fetch a user by username (uses `withIndex("by_username")`)
- `auth.getActiveUsers(workspace)` – list active users in a workspace
- `notes.listNotes()` – list all notes (real‑time) sorted by `updatedAt`
- `notes.searchNotes(searchString)` – simple in‑memory search across all notes
- `logs.getLogs()` – latest 100 logs via `withIndex("by_timestamp")`
- `logs.getStats()` – aggregate counts and average execution time

Key patterns:

- Explicit validators and return types with `v.*`
- `withIndex` instead of scanning + filtering
- Real‑time updates in React via `useQuery`

### Mutations – write operations

- `auth.loginDemoUser({ username, workspace })` – upsert a user and mark `lastActive`
- `auth.logoutUser({ username })` – mark user as inactive
- `notes.createNote({ userId, workspace, title, content })`
- `notes.updateNote({ userId, workspace, noteId, title, content })` – includes workspace authorization check
- `notes.deleteNote({ userId, workspace, noteId })` – includes workspace authorization check
- `logs.addLog({ type, operation, data, executionTime?, userId? })`
- `logs.clearLogs()` – clears logs and inserts an audit entry

Key patterns:

- Use of `ctx.scheduler.runAfter(0, api.logs.addLog, ...)` to record operation metadata asynchronously
- Guarding writes with simple authorization checks (workspace ownership)

### Actions – cross‑runtime/external APIs

- `ai.generateRandomNote({ userId, workspace })`
  - Declared with `"use node"` and `action({...})`
  - Reads `OPENAI_API_KEY` from Convex environment
  - Calls OpenAI Chat Completions to generate a JSON `{ title, content }`
  - Persists via `ctx.runMutation(api.notes.createNote, ...)`

Key patterns:

- Keep external I/O in Actions (non‑deterministic, uses Node APIs)
- Validate inputs and return shapes even for Actions
- Handle errors and log via a mutation

---

## App tour (UI)

- Login screen: enter a `username` and a `workspace` (demo auth). Session is stored locally.
- Notes panel:
  - Create new notes (Tailwind forms, validation, optimistic feel)
  - AI Generate Note (calls Action; requires `OPENAI_API_KEY`)
  - Real‑time list of notes from all workspaces with skeleton loading
  - Workspace permissions: you can edit/delete only notes from your workspace
- Logs panel:
  - Live feed of the last 100 structured logs
  - Stats: total queries/mutations, average execution time, active connections

---

## File map (high level)

- `convex/schema.ts` – tables and indexes
- `convex/auth.ts` – demo auth queries/mutations
- `convex/notes.ts` – CRUD mutations and list/search queries
- `convex/logs.ts` – logging queries/mutations + stats
- `convex/ai.ts` – OpenAI Action that writes via a mutation
- `src/App.tsx` – top‑level app (Convex React hooks)
- `src/components/**` – UI (Tailwind)

---

## Troubleshooting

- AI generation fails immediately:
  - Ensure `OPENAI_API_KEY` is set in Convex: `npx convex env set OPENAI_API_KEY ...`
  - Check the Convex dashboard logs for `ai.generateRandomNote`
- Convex dev server won’t link:
  - Re‑run `npx convex dev` and follow the login/link prompts
- No notes appear after creating one:
  - Confirm the mutation succeeded in the dashboard and no validator errors occurred

---

## License

See `LICENSE.txt`.
