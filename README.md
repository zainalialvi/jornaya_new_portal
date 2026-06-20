# Form Submission Dashboard

A complete multi-tenant form submission dashboard with FastAPI backend, React + Vite frontend, and MongoDB Atlas as the database.

## Prerequisites

- Docker Desktop (with Docker Compose v2)
- A MongoDB Atlas cluster + connection URI

No local Node, Python, or MongoDB install required.

## Quick Start

```bash
cp .env.example .env
# edit .env — paste your Atlas MONGO_URI, set JWT_SECRET
docker compose up --build
```

This builds and starts two services:

| Service  | URL                                    | Purpose                      |
| -------- | -------------------------------------- | ---------------------------- |
| Frontend | http://localhost:5173                  | React dashboard (nginx)      |
| Backend  | http://0.0.0.0:8989 (http://localhost:8989) | FastAPI API + Swagger docs |

Swagger UI lives at http://localhost:8989/docs.

All ports can be overridden in `.env` (`FRONTEND_PORT`, `BACKEND_PORT`).

## First-Time Seed

Atlas starts empty (or whatever state you left it in). Populate demo data:

```bash
docker compose exec backend python seed.py
```

Demo accounts:

| Role       | Username      | Password        |
| ---------- | ------------- | --------------- |
| admin      | `admin_main`  | `admin123@main` |
| supervisor | `supervisor1` | `super123`      |
| user       | `user1`       | `user123`       |

Seeded company: **Acme Corp** (active by default).

Log in at http://localhost:5173/login.

## Environment Variables

All config lives in `.env` at the repo root. See `.env.example` for the full list. Highlights:

- `MONGO_URI` — your Atlas SRV URI (`mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/...`).
- `MONGO_DB_NAME` — database name (default `form_dashboard`).
- `MONGO_TLS` — leave `true` for Atlas. The driver auto-detects TLS from `mongodb+srv://`, so this is usually redundant but explicit.
- `JWT_SECRET` — **change before deploying anywhere real.**
- `BACKEND_PORT` — host port the API is published on. Container internally binds `0.0.0.0:8989`, so keep it at `8989` unless you need to remap.
- `VITE_API_URL` — URL the **browser** uses to reach the API. Local dev: `http://localhost:8989`. On a cloud deploy, set it to your public API URL (e.g. `https://api.your-domain.com`).

> `VITE_API_URL` is baked in at build time. After changing it:
> ```bash
> docker compose up --build frontend
> ```

## Deploying to Cloud

The backend binds `0.0.0.0:8989` inside the container, which is the right setting for any cloud host that routes traffic to your container's exposed port.

Typical flow:
1. Provision your host (VM, ECS, Cloud Run, Fly, Render, etc.).
2. Set the environment variables from `.env.example` on the platform — **never** commit `.env`.
3. Set `VITE_API_URL` to your public API URL before the frontend build.
4. Publish port `8989` (backend) and `80` (frontend) through your load balancer / ingress.

## Common Commands

```bash
# Tail logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild a single service after code changes
docker compose up --build backend

# Full reset (containers only — Atlas data is untouched)
docker compose down

# Open a shell in the backend container
docker compose exec backend bash
```

## Health Checks & Restart Policy

Both services define a Docker healthcheck and `restart: unless-stopped`:

- **backend** — `GET /healthz` (via `curl` inside the container)
- **frontend** — `GET /healthz` on nginx (via `wget`)

The frontend waits for the backend to be healthy (`depends_on: condition: service_healthy`) before starting.

## Architecture

### Backend
- FastAPI with async Motor (MongoDB driver)
- JWT authentication with access and refresh tokens
- Role-based access control
- Server-side form validation
- CSV export functionality

### Frontend
- React 18 with Vite
- Ant Design component library
- React Router for navigation
- React Hook Form for form handling
- Axios for API calls
- Served in production by nginx with SPA fallback + static asset caching

### Database
- MongoDB Atlas
- Collections: `companies`, `forms`, `users`, `submissions`, `audits`
- Indexes created on startup (`backend/main.py` `_ensure_indexes`)

## Roles

- **admin**: manages companies, users, forms, views audits, toggles company active/inactive
- **supervisor**: views/exports submissions for their company, views the form in read-only mode
- **user**: fills and submits their company form
- **bot**: calls `POST /bot/poll` and `POST /bot/result` (no auth)

## API Endpoints

### Authentication
- `POST /auth/login`
- `POST /auth/refresh`

### Companies (Admin only)
- `POST /companies`
- `GET /companies`
- `PATCH /companies/{company_id}/active`

### Forms
- `POST /companies/{company_id}/form` *(admin)*
- `GET /companies/{company_id}/form` *(any authenticated user)*
- `DELETE /companies/{company_id}/form/{form_id}` *(admin)*

### Users (Admin only)
- `POST /companies/{company_id}/users`
- `GET /companies/{company_id}/users`
- `DELETE /users/{user_id}`

### Submissions
- `POST /submissions` *(user)*
- `GET /submissions` *(supervisor/admin)*
- `GET /submissions/{submission_id}`
- `GET /submissions/export`

### Bot (no auth)
- `POST /bot/poll` — returns `[]` silently if the company is inactive
- `POST /bot/result`

### Audits (Admin only)
- `GET /audits`

## Key Features

1. **Multi-tenant** — each company has isolated users and forms
2. **Dynamic forms** — admin builds custom forms with per-field validation
3. **Company active/inactive** — admin toggle; inactive companies block user/supervisor login and return empty bot polls
4. **Bot integration** — automated submission processing with retry + auto-fail after 3 attempts
5. **Audit trail** — logs create/delete of companies, forms, users, and auto-failed submissions
6. **CSV export** — submissions export with filtering
7. **Role-based access** — enforced at the API level
