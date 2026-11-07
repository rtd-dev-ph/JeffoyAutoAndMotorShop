# JeffoyAutoAndMotorShop

A web-based inventory and sales management system for **Jeffoy Auto and Motor Shop** — POS, product/category/inventory management, stock movements, sales history, and reporting.

- Repo: https://github.com/rtd-dev-ph/JeffoyAutoAndMotorShop
- Live demo (GitHub Pages, frontend-only, no backend): https://rtd-dev-ph.github.io/JeffoyAutoAndMotorShop/

## Tech stack

| Layer | Choice |
|---|---|
| Backend | ASP.NET Core Web API, .NET 10 |
| ORM | EF Core 10 + Npgsql |
| Database | PostgreSQL 17 (Docker Compose) |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | react-router-dom |
| API client | Typed `apiClient.ts` in frontend |

## Repo structure

```
/backend/JeffoyAutoAndMotorShop.Api/   # .NET Web API (Controllers, DTOs, Models, Services, Data)
/frontend/                             # React SPA (src/pages, src/lib, src/types, src/components)
/openspec/                             # OpenSpec implementation specs (per feature slice)
/.github/workflows/deploy-pages.yml     # GitHub Pages demo deploy
/compose.yaml                          # PostgreSQL 17 database service
/.env.example                          # Environment variable template (copy to .env)
```

## Getting started (real app with backend)

### Backend

1. Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD` (never commit `.env`).
2. Start the database:

   ```bash
   docker compose up -d
   ```

3. Run migrations (first time):

   ```bash
   cd backend/JeffoyAutoAndMotorShop.Api
   dotnet ef database update
   ```

4. Run the API:

   ```bash
   dotnet run
   ```

   The API listens at `http://localhost:5122`.

### Frontend

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

   The frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:5122`.

## Demo mode (GitHub Pages, no backend)

Set `VITE_DEMO_MODE=true` to run the frontend entirely in-browser with seeded data and `localStorage` persistence — no ASP.NET API or PostgreSQL required.

```bash
cd frontend
VITE_DEMO_MODE=true npm run dev          # local demo
VITE_DEMO_MODE=true VITE_BASE=/JeffoyAutoAndMotorShop/ npm run build  # Pages build
```

Demo accounts (demo mode only):

| Role | Username | Password |
|---|---|---|
| Owner | `admin` | `Admin123!` |
| Cashier (mechanic/front-counter) | `jeffoy` | `Jeffoy123!` |

Demo data is stored in the browser (`localStorage`: `jaams_demo_state_v1` + `jaams_token`). Clearing site data resets the demo. **Do not** set `VITE_DEMO_MODE=true` for a real deployment.

The GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) builds with `VITE_DEMO_MODE=true` and publishes `frontend/dist` on push to `main`. Enable **Settings → Pages → Source: GitHub Actions** once.

## Features

- Dashboard with daily sales summary (transactions, items, totals, cash/GCash)
- POS / checkout with cart and payment method
- Products CRUD (SKU, price, stock, low-stock threshold)
- Categories CRUD
- Sales history + sale detail + void
- Stock movements / restock
- Reports (daily, CSV/JSON export, print preview)
- Auth: JWT login, session restore on refresh, Owner-only Users page (create user with role)

## MVP feature order (complete)

1. Layout + Routing
2. POS / Checkout
3. Products CRUD
4. Categories CRUD
5. Sales History + void
6. Stock Movements / Restock
7. Dashboard / Reports
8. Users / role creation (Owner-only)

## Development workflow (KOS + OpenSpec)

This project uses the **KOS Command Center** for project context and **OpenSpec** for per-slice implementation specs.

| Tool | Purpose |
|---|---|
| KOS Command Center | Knowledge base: context, decisions, flows, learnings |
| OpenSpec | `openspec/` — implementation specs driving AI code generation |
| Repo | Actual codebase |

Workflow per slice: orient → plan → write OpenSpec change → implement → test against real API → wrap up (update handoff, log gotchas, archive change).

## Security status

- JWT authentication with role claims; session restored client-side from token claims (server validates)
- Owner-only `GET/POST /api/auth/users` with role validation (`Cashier`, `Owner`)
- Authorization pipeline configured (`[Authorize(Roles="Owner")]`)
- Input validation on all endpoints (SKU uniqueness, price checks, category active checks, etc.)
- Safe error responses via `ProblemDetails`; no exception details leaked to client
- Soft deletes (`IsActive`) on products/categories; sales use `Status` instead of hard deletes
- Secrets: `.env` is gitignored; `.env.example` committed as template
- CORS / rate limiting / security headers planned (needed for cross-origin hosted API)

## Testing

```bash
cd frontend
npm run build            # typecheck + production build
npx playwright test      # e2e (auth-session + select-states)
npx tsc --noEmit         # typecheck
```

Backend:

```bash
cd backend/JeffoyAutoAndMotorShop.Api
dotnet build
```

## License

Internal project for Jeffoy Auto and Motor Shop.
