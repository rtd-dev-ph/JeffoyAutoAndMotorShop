# OpenSpec Change: Token-Based Authentication (JWT)

## Change ID
`authentication`

## Status
Planning

## Summary
Add JWT-based username/password authentication with role-based authorization (Cashier/Owner) to the ASP.NET Core API, plus a React login flow that stores the token in `localStorage` and attaches it to outgoing requests. Read endpoints stay public; write/destructive endpoints require a valid token.

## Why JWT
- Stateless — fits a React SPA + REST API cleanly
- Easy to teach and debug: you can inspect the token payload in DevTools or jwt.io
- Works with the existing `apiClient.ts` pattern (just add an `Authorization` header)

## Tradeoff: localStorage vs httpOnly cookies

| | localStorage | httpOnly cookies |
| :--- | :--- | :--- |
| XSS vulnerability | **Yes** — any script can read the token | No — JS can't read it |
| CSRF vulnerability | No | **Yes** — needs SameSite + CSRF protection |
| Complexity | Low — one header, no server session state | Medium — needs CORS cookie setup + CSRF |
| Best for | Learning, internal tools, same-origin SPA | Public-facing apps with strict security |

**Decision:** `localStorage` for now, because it keeps the learning loop tight and matches the SPA architecture. I'll document the XSS risk clearly so you can migrate to httpOnly cookies later.

## Scope — what's protected

| Endpoint | Method | Auth required? | Roles |
| :--- | :--- | :--- | :--- |
| `GET /api/products` | GET | No | — |
| `GET /api/products/search` | GET | No | — |
| `GET /api/products/{id}` | GET | No | — |
| `GET /api/products/all` | GET | No | — |
| `GET /api/products/low-stock` | GET | No | — |
| `GET /api/categories` | GET | No | — |
| `GET /api/categories/{id}` | GET | No | — |
| `GET /api/stock` | GET | No | — |
| `GET /api/health/database` | GET | No | — |
| `POST /api/auth/login` | POST | No | — |
| `POST /api/products` | POST | Yes | Cashier, Owner |
| `PUT /api/products/{id}` | PUT | Yes | Cashier, Owner |
| `DELETE /api/products/{id}` | DELETE | Yes | Owner only |
| `POST /api/categories` | POST | Yes | Cashier, Owner |
| `PUT /api/categories/{id}` | PUT | Yes | Cashier, Owner |
| `DELETE /api/categories/{id}` | DELETE | Yes | Owner only |
| `POST /api/sales/checkout` | POST | Yes | Cashier, Owner |
| `POST /api/sales/{id}/void` | POST | Yes | Owner only |
| `POST /api/stock/{productId}/reorder` | POST | Yes | Cashier, Owner |
| `GET /api/reports/daily-sales` | GET | Yes | Owner only |

Rationale: browsing products/categories/stock is read-only and safe to keep public. Anything that changes state (create/update/delete, checkout, void, restock, reports) requires auth. Owner-only actions are destructive or financially sensitive (delete, void, reports).

## Files to change (backend)

1. `backend/JeffoyAutoAndMotorShop.Api/JeffoyAutoAndMotorShop.Api.csproj` — add `Microsoft.AspNetCore.Authentication.JwtBearer` + `BCrypt.Net-Next`
2. `backend/JeffoyAutoAndMotorShop.Api/Models/User.cs` — new entity: Id, Username, Email, PasswordHash, Role, IsActive, CreatedAtUtc
3. `backend/JeffoyAutoAndMotorShop.Api/Data/AppDbContext.cs` — add `DbSet<User> Users`
4. `backend/JeffoyAutoAndMotorShop.Api/DTOs/Auth/LoginRequestDto.cs` — Username/Email + Password
5. `backend/JeffoyAutoAndMotorShop.Api/DTOs/Auth/LoginResponseDto.cs` — Token + Expiration + User info
6. `backend/JeffoyAutoAndMotorShop.Api/Services/JwtService.cs` — GenerateToken(user), validate config
7. `backend/JeffoyAutoAndMotorShop.Api/Controllers/AuthController.cs` — POST /api/auth/login
8. `backend/JeffoyAutoAndMotorShop.Api/appsettings.json` — add Jwt section (Issuer, Audience, Key placeholder, ExpirationMinutes)
9. `backend/JeffoyAutoAndMotorShop.Api/Program.cs` — AddAuthentication(JwtBearer), AddAuthorization(role policies), UseAuthentication, seed default user
10. Controllers to protect: ProductsController, CategoriesController, SalesController, StockController, ReportsController — add `[Authorize]` + `[Authorize(Roles = "Owner")]` where needed
11. EF Core migration for Users table

## Files to change (frontend)

1. `frontend/src/types/api.ts` — add `LoginRequest`, `LoginResponse`, `UserDto`, `AuthState` interfaces
2. `frontend/src/lib/apiClient.ts` — attach `Authorization: Bearer <token>` from localStorage on every request; handle 401 by clearing token
3. `frontend/src/contexts/AuthContext.tsx` — new context: user, token, login(), logout(), isAuthenticated
4. `frontend/src/pages/LoginPage.tsx` — login form POST /api/auth/login, store token, redirect
5. `frontend/src/App.tsx` — add `/login` route, protect nav based on auth state
6. `frontend/src/main.tsx` — add `/login` route (no layout shell needed)

## Seed user
Seed a default `Owner` user on first run so you can log in immediately:
- Username: `admin`
- Password: `Admin123!` (change on first use in production)
- Role: `Owner`
