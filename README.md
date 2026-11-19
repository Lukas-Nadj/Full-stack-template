# Full-Stack Application Template

A clean, modular starter template for full-stack applications with React, Node.js Express, and MySQL, orchestrated via Docker Compose.

---

## Architecture & Project Structure

The project is structured into three self-contained directories:

```text
.
├── app/                  # React Frontend (Vite + TypeScript + Nginx)
│   ├── src/              # React components, styles, and entry point
│   ├── index.html        # HTML shell
│   ├── nginx.conf        # Production Nginx reverse-proxy & SPA fallback
│   ├── Dockerfile        # Multi-stage build + Nginx static serving
│   └── package.json
│
├── api/                  # Express REST API (Node.js + TypeScript)
│   ├── src/              # Express routes, database connection pool
│   │   ├── db.ts         # MySQL connection pool
│   │   └── index.ts      # API server & sample endpoints (/api/health, /api/items)
│   ├── Dockerfile        # Multi-stage Node.js build
│   └── package.json
│
├── db/                   # Relational Database (MySQL 8.4)
│   ├── init/             # SQL scripts executed on initial startup
│   │   └── 01-init.sql   # Starter schema & seed data
│   └── volume/           # Persistent database volume directory
│
└── docker-compose.yml    # Root multi-container orchestration
```

---

## Quick Start (Docker Compose)

Start the complete stack with a single command:

```bash
docker compose up --build
```

Once started:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **MySQL Database**: `localhost:3306` (`app_user` / `app_password`, database `app_db`)

To stop the containers:

```bash
docker compose down
```

To reset the database and re-run initialization scripts:

```bash
docker compose down
rm -rf db/volume/*
docker compose up --build
```

---

## Local Development (Without Docker)

You can run the frontend and backend locally on your host machine while running MySQL either natively or via Docker.

### 1. Database
Run only the MySQL container:
```bash
docker compose up db
```

### 2. Backend API (`api/`)
```bash
cd api
npm install
npm run dev
```
The API starts at [http://localhost:4000](http://localhost:4000) with hot-reloading via `tsx`.

### 3. Frontend App (`app/`)
```bash
cd app
npm install
npm run dev
```
The Vite development server starts at [http://localhost:3000](http://localhost:3000). Vite automatically proxies `/api/*` calls to `http://localhost:4000` so no CORS configuration is needed.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Live health check (tests database connection & uptime) |
| `GET` | `/api/items` | Returns all items ordered by newest first |
| `POST` | `/api/items` | Creates a new item (`{ "title": "...", "description": "..." }`) |
| `DELETE` | `/api/items/:id` | Deletes an item by ID |

---

## Extending the Template

1. **Add Database Tables**: Add `.sql` scripts to `db/init/` or update `01-init.sql`.
2. **Add API Routes**: Add route handlers in `api/src/` and mount them in `api/src/index.ts`.
3. **Build Frontend UI**: Add components and pages in `app/src/`.
