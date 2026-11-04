# Design

## Context

Frontend currently has a single `App.tsx` health-check UI consuming `apiClient.ts` + `types/api.ts`. Backend runs at `http://localhost:5122`. Existing `apiClient.ts`, `config.ts`, `types/api.ts` must stay untouched (see DEC-002). Tech stack per DEC-001: Tailwind CSS + shadcn/ui, react-router-dom for routing.

See proposal.md for motivation (why) and specs/pos-checkout/spec.md for requirements (what).

## Goals / Non-Goals

**Goals:**
- Layout + routing scaffold (shell, nav, outlets)
- POS page with product search, cart, payment selector, checkout, receipt
- Real checkout against the running API

**Non-Goals:**
- Products/Categories CRUD screens
- Sales history / void UI
- Stock movements UI
- Dashboard / reports UI
- Backend changes

## Decisions

- **Layout + routing first, then POS page** — matches MVP order (Layout + Routing before POS / Checkout).
- **Tailwind CSS + shadcn/ui** — DEC-001, consistent UI with minimal custom CSS; shadcn v4 + Vite plugin.
- **Keep apiClient.ts, config.ts, types/api.ts untouched** — DEC-002; import `apiClient` and DTO types directly into components.
- **react-router-dom for routing** — one route for POS (`/`), receipt route optional query param (`/receipt?saleId=...`).
- **Cart held in local React state** — no server cart; checkout POSTs the full CheckoutDto at once.
- **One OpenSpec change per slice** — this change covers only POS/checkout; later slices get their own changes.

## Risks / Trade-offs

- [Backend must be running] → Verify `dotnet run` in API project before testing; health endpoint `/health/database` confirms DB connectivity.
- [Vite dev proxy must point to http://localhost:5122] → Check vite config / lib/config.ts proxy target matches API base.
- [Local cart state not persisted] → Refresh loses cart; acceptable for MVP slice 1.

## Open Questions

None — all decisions resolved from proposal, specs, and existing project context.
