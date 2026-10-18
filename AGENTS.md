# Project Instructions — JeffoyAutoAndMotorShop

> Adapted for this specific repository. The agent should read this file before making changes.

## Project purpose

Build a manageable portfolio application for a motor shop (Jeffoy Auto and Motor Shop), starting with inventory and sales management, while learning modern web development fundamentals. The backend is a C# ASP.NET Core Web API with PostgreSQL, with a planned React + TypeScript + Vite frontend.

## Technology and constraints

- **Backend**: C#, ASP.NET Core Web API, .NET 10.0
- **ORM**: Entity Framework Core 10, Npgsql provider
- **Database**: PostgreSQL 17 via Docker Compose (`compose.yaml`)
- **Frontend**: React + TypeScript + Vite (planned, not yet started)
- All timestamps stored in UTC
- Monetary columns use `numeric(18,2)`
- Soft deletes via `IsActive` flags on Categories and Products
- Sales use `Status` field (Completed/Voided) — no hard deletes
- Stock movements record `ResultingStockQuantity` for verification
- SKUs must be unique (case-insensitive)
- Categories cannot be deleted if they have active products (ON DELETE RESTRICT)

## Repository layout

```
JeffoyAutoAndMotorShop/
├── compose.yaml               # PostgreSQL 17 container
├── .env                       # Local secrets (gitignored)
├── .env.example               # Template
├── AGENTS.md                  # This file
├── README.md
├── JeffoyAutoAndMotorShop.sln
└── backend/
    └── JeffoyAutoAndMotorShop.Api/
        ├── Controllers/       # API endpoints
        ├── Data/              # DbContext, configurations, migrations
        ├── DTOs/              # Request/response DTOs
        ├── Models/            # Domain entities
        └── Services/          # Business logic
```

## How to work

- Inspect existing code and documentation before changes.
- Work on one bounded task at a time. Refer to the task board in the project notes.
- Follow requirements and acceptance criteria from the database design and setup log.
- Prefer the simplest solution that meets the need.
- Explain unfamiliar concepts and help the developer learn.
- Preserve unrelated behavior; do not change unrelated code without a clear reason.
- Do not expose secrets from `.env` files or logs.
- Never perform destructive database operations without explicit approval.
- Obtain approval for major architecture or dependency changes.

## Verification

- Run `dotnet build` after changes.
- Run `dotnet run` and test endpoints with `curl` or the `.http` file.
- Run `dotnet ef database update` to apply migrations.
- Inspect and summarize the diff.
- Report actual commands and results.
- Identify what remains unverified.

## Safety

- Do not expose secrets.
- Do not deploy or run destructive operations without explicit approval.
- Do not delete data or reset databases without explicit approval.
- Obtain approval for major architecture or dependency changes.

## Daily workflow

1. Review the dashboard and active project.
2. Choose one small task with clear acceptance criteria.
3. Attempt the task or ask for hints.
4. Run appropriate checks and inspect the diff.
5. Record actual results and what was learned in the daily log.
6. Update task status and carry unfinished work forward.

## Next steps (from Setup Log)

1. ~~Change .env placeholder password~~ — security task for the developer
2. ✅ Data annotation validation added to all request DTOs (Session 2, Oct 19)
3. ✅ Daily sales reporting endpoint implemented (`GET /api/reports/daily-sales`) (Session 2, Oct 19)