# WorkspaceHub

WorkspaceHub is a full-stack team workspace application built with the MERN stack and TypeScript. It supports multi-tenant organizations, role-based access, project and task management, bookings, feature flags, and task comment threads with role-aware editing and deletion.

## Features

- JWT-based authentication with organization-scoped data
- Owner, admin, and member roles with centralized permission rules
- Project and task creation, editing, deletion, and task-count metrics
- Booking creation with client-side validation
- Task comments with real comment counts, lazy loading, create/edit/delete actions, and an `Unknown user` fallback for deleted authors
- Server-side authorization that allows owners/admins to manage any comment and members to manage only their own
- MongoDB Atlas-ready database connection caching for serverless deployment
- Client and API deployment on Vercel

## Live Site

https://ai-se-project-workspacehub-client-git-worksp-93b026-triple-ten2.vercel.app

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication
- Context API for client state
- Vitest
- ESLint + Prettier
- GitHub Actions
- Vercel

## Project Structure

```text
workspacehub/
  client/
  server/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Recommended local values:

```env
# server/.env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/workspacehub
JWT_SECRET=replace-with-a-local-development-secret
CLIENT_ORIGIN=http://localhost:5173
```

```env
# client/.env
VITE_API_URL=http://localhost:5001
```

3. Start MongoDB locally or point `MONGODB_URI` at an existing MongoDB instance.

4. Seed demo data:

```bash
npm run seed
```

5. Run the server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Environment Variables

| Variable | Location | Purpose | Example |
| --- | --- | --- | --- |
| `PORT` | `server/.env` | Local API port | `5001` |
| `MONGODB_URI` | `server/.env` | MongoDB connection string | `mongodb://127.0.0.1:27017/workspacehub` |
| `JWT_SECRET` | `server/.env` | Secret used to sign and verify JWTs | `replace-with-a-local-development-secret` |
| `CLIENT_ORIGIN` | `server/.env` | Allowed browser origin for CORS | `http://localhost:5173` |
| `VITE_API_URL` | `client/.env` | Base URL of the API used by the Vite client | `http://localhost:5001` |

Never commit real production secrets or the MongoDB Atlas connection string. Configure production values in Vercel environment variables.

## Demo Users

The local seed script creates one organization with these users:

- `owner@workspacehub.dev` / `Password123!`
- `admin@workspacehub.dev` / `Password123!`
- `member@workspacehub.dev` / `Password123!`

## Scripts

- `npm run dev:server`
- `npm run dev:client`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run seed`

## API Response Shape

Protected API responses use the same JSON envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Permission logic is centralized in permission helpers, and the API scopes protected data to the authenticated organization.
