# gophar

Uptime monitoring system built with **Go + Gin**, a background **worker engine (goroutines)**, and **PostgreSQL**, with a simple **React (Vite + TS)** dashboard.

> Goal: Add URLs, check them on an interval, store results, and visualize uptime/latency history.

---

## ✨ Core Components (Kaun kya karega?)

- **Frontend (The Face)**
  - Simple dashboard where users can **sign up / log in**, **add URLs**, set **frequency**, and view **status + history**.
  - Tech: React (Vite + TypeScript) under `frontend/`.

- **Backend API (The Brain — Gin Framework)**
  - Handles **Auth (Signup/Login)**, **Monitor CRUD**, and **History APIs**.
  - Responsible for validation, auth middleware, and serving data to the dashboard.

- **Worker Engine (The Muscle — Goroutines)**
  - Runs in the background and continuously schedules checks (every **1–5 minutes**).
  - Uses a **worker pool** (e.g., 10–20 goroutines) to ping multiple URLs concurrently.

- **Database (The Memory — PostgreSQL)**
  - Stores users, monitors, and check logs (status + latency).

---

## 🔄 Life Cycle of a Request (User Journey)

### Phase 1: Entry (Auth)
1. **Signup/Login** with email/password.
2. Backend generates a **JWT** token.
3. **Security**: Without a valid JWT, users cannot add monitors or view history (**middleware** protects routes).

### Phase 2: Management (CRUD)
1. **Add Monitor**: user submits a URL (e.g. `https://google.com`) and frequency (e.g. "every 5 minutes").
2. Backend saves it in the **monitors** table.

### Phase 3: Background Magic (Concurrency)
1. **Scheduler** goroutine keeps running and fetches monitors that are due.
2. **Worker Pool** executes checks concurrently.
3. **Persist results**: each check writes **Up/Down + Latency + Timestamp** into the **logs** table.

### Phase 4: Monitoring & Alerts
1. Dashboard reads from logs to show **current status** and **graphs/history**.
2. If a monitor is **Down**, backend can emit alerts (initially console; later email/Telegram).

---

## 🗄️ Database Schema (The Logic)

### `users`
- `id`
- `email`
- `password_hash`
- `created_at`

### `monitors`
- `id`
- `user_id` (FK → users)
- `url`
- `frequency`
- `is_active`
- `created_at`

### `logs`
- `id`
- `monitor_id` (FK → monitors)
- `status` (UP/DOWN)
- `latency`
- `checked_at`

---

## 🧠 How It Works Under the Hood

When you start the server, two main things should run:

1. **Gin HTTP Server**
   - Listens on `:8080` and handles all HTTP requests.

2. **Background Cron/Scheduler**
   - An infinite loop using `time.Ticker` that wakes up every *X seconds*, queries the DB for due monitors, and dispatches work to the worker pool.

---

## 📁 Repo Structure (high level)

- `README.md` — project overview
- `frontend/` — React + TypeScript (Vite) dashboard

---

## 🚀 Getting Started (suggested)

> Exact commands may vary depending on the current implementation in this repo.

### Backend
```bash
# from repo root
go mod tidy
go run ./...
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧩 Roadmap

- [ ] JWT auth middleware + refresh strategy
- [ ] Monitor CRUD + validation
- [ ] Worker pool + scheduler with per-monitor frequency
- [ ] Status page + graphs
- [ ] Alerting: Email / Telegram

---

## 🤝 Contributing

PRs and issues are welcome. Keep changes small and include context + tests where possible.
