# JeffoyAutoAndMotorShop

A web-based inventory and sales management system for Jeffoy Auto and Motor Shop.

| Layer | Choice |
| :--- | :--- |
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
/compose.yaml                          # PostgreSQL 17 database service
/.env.example                          # Environment variable template (copy to .env)
```

## Getting started

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

## MVP feature order

1. Layout + Routing
2. POS / Checkout (most valuable screen)
3. Products CRUD
4. Categories CRUD
5. Sales History + void
6. Stock Movements / Restock
7. Dashboard / Reports

All six slices above are complete and verified against the live API.

## Development workflow (KOS + OpenSpec)

This project uses the **KOS Command Center** for project context and **OpenSpec** for per-slice implementation specs.

| Tool | Purpose |
| :--- | :--- |
| KOS Command Center | `Documents/AI Workspace/KOS Command Center` — knowledge base: context, decisions, flows, learnings |
| OpenSpec | `openspec/` — implementation specs driving AI code generation |
| Repo | Actual codebase |

Workflow per slice:

1. Orient — read KOS `PROJECT-CONTEXT.md`, `User-Flows.md`, `handoff.md`
2. Plan slice — pick one page/flow, sketch it, update `User-Flows.md`
3. Write OpenSpec change — `openspec/changes/<slice>/` with `proposal.md` + `tasks.md`
4. Implement — read KOS context + implement OpenSpec change strictly by tasks
5. Test against real API — `dotnet run` + `npm run dev`, verify real behavior
6. Wrap up — update KOS `handoff.md`, log gotchas in `memory.md`, archive OpenSpec change

## Security status

- **HTTPS redirection** enabled
- **Authorization pipeline** configured but **no authentication scheme yet** (endpoints are public locally)
- **Input validation** on all endpoints (SKU uniqueness, price checks, category active checks, etc.)
- **Safe error responses** via `ProblemDetails`; no exception details leaked to client
- **Soft deletes** (`IsActive`) on products/categories; sales use `Status` instead of hard deletes
- **Secrets**: `.env` is gitignored; `.env.example` committed as template
- **Logging**: Built-in ASP.NET Core console logging; `appsettings.json` sets `Default: Information`, `Microsoft.AspNetCore: Warning`

**Not yet implemented**: JWT authentication, role-based access control, CORS policy for cross-origin API calls, rate limiting, security headers. These are planned next steps.

## License

Internal project for Jeffoy Auto and Motor Shop.
