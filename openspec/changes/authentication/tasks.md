# Tasks: Token-Based Authentication (JWT)

## Phase 1 — Backend: Auth infrastructure

- [ ] 1.1 Add NuGet packages: `Microsoft.AspNetCore.Authentication.JwtBearer`, `BCrypt.Net-Next`
- [ ] 1.2 Create `Models/User.cs` entity (Id, Username, Email, PasswordHash, Role, IsActive, CreatedAtUtc)
- [ ] 1.3 Add `DbSet<User> Users` to `AppDbContext.cs`
- [ ] 1.4 Create `DTOs/Auth/LoginRequestDto.cs` and `DTOs/Auth/LoginResponseDto.cs`
- [ ] 1.5 Create `Services/JwtService.cs` — GenerateToken(user) using configured key/issuer/audience/expiration
- [ ] 1.6 Create `Controllers/AuthController.cs` — POST /api/auth/login (validate credentials, return JWT)
- [ ] 1.7 Add `Jwt` section to `appsettings.json` (Issuer, Audience, Key placeholder, ExpirationMinutes)
- [ ] 1.8 Configure `Program.cs`: AddAuthentication(JwtBearer), AddAuthorization with role policies (`Cashier`, `Owner`), UseAuthentication before UseAuthorization
- [ ] 1.9 Seed default Owner user (`admin` / `Admin123!`) in Program.cs if no users exist
- [ ] 1.10 Add EF Core migration for Users table; apply to database

## Phase 2 — Backend: Protect endpoints

- [ ] 2.1 ProductsController: `[Authorize]` on POST/PUT/DELETE; `[Authorize(Roles = "Owner")]` on DELETE
- [ ] 2.2 CategoriesController: `[Authorize]` on POST/PUT/DELETE; `[Authorize(Roles = "Owner")]` on DELETE
- [ ] 2.3 SalesController: `[Authorize]` on POST /api/sales/checkout; `[Authorize(Roles = "Owner")]` on POST /api/sales/{id}/void
- [ ] 2.4 StockController: `[Authorize]` on POST /api/stock/{productId}/reorder
- [ ] 2.5 ReportsController: `[Authorize(Roles = "Owner")]` on GET /api/reports/daily-sales
- [ ] 2.6 Verify GET endpoints remain unauthenticated (products, categories, stock, health)

## Phase 3 — Frontend: Auth types + API client

- [ ] 3.1 Add auth types to `frontend/src/types/api.ts` (LoginRequest, LoginResponse, UserDto)
- [ ] 3.2 Update `frontend/src/lib/apiClient.ts` to read token from localStorage and attach `Authorization: Bearer` header; clear token on 401

## Phase 4 — Frontend: Auth context + login page

- [ ] 4.1 Create `frontend/src/contexts/AuthContext.tsx` (user, token, login(), logout(), isAuthenticated)
- [ ] 4.2 Create `frontend/src/pages/LoginPage.tsx` (form POST /api/auth/login, store token, redirect to /)
- [ ] 4.3 Add `/login` route to `frontend/src/main.tsx`
- [ ] 4.4 Update `frontend/src/App.tsx` nav: show Login/Logout based on auth state; protect restricted links

## Phase 5 — Verify end-to-end

- [ ] 5.1 `dotnet build` succeeds
- [ ] 5.2 `npx tsc --noEmit` succeeds
- [ ] 5.3 Register/login via React UI returns token stored in localStorage
- [ ] 5.4 POST /api/products with valid token returns 201; without token returns 401
- [ ] 5.5 POST /api/products with Cashier token returns 201; DELETE returns 403 (Owner-only)
- [ ] 5.6 GET /api/products without token still works (public read)
- [ ] 5.7 Logout clears token and redirects to login

## Definition of done
Backend issues 401 for unauthenticated write requests, 403 for insufficient roles, returns valid JWT on login; frontend can log in, attach token to requests, and logout. All verified against live API.
