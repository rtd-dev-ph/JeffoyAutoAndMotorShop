# JeffoyAutoAndMotorShop

A web-based inventory and sales management system for Jeffoy Auto and Motor Shop, built with React, TypeScript, ASP.NET Core Web API, and PostgreSQL.

## Project Structure

```
JeffoyAutoAndMotorShop/
├── .env                       # Local secrets - NOT tracked in git
├── .env.example               # Template with placeholders only
├── .gitignore
├── JeffoyAutoAndMotorShop.sln # Solution file
├── compose.yaml               # PostgreSQL container configuration
├── backend/
│   └── JeffoyAutoAndMotorShop.Api/
│       ├── Controllers/       # API controllers
│       ├── Data/              # EF Core DbContext and configurations
│       ├── DTOs/              # Data transfer objects
│       ├── Models/            # Domain models
│       ├── Services/          # Business logic services
│       ├── Program.cs         # Application entry point
│       ├── appsettings.json   # Base configuration
│       └── JeffoyAutoAndMotorShop.Api.csproj
└── frontend/
    └── (planned React + TypeScript + Vite app)
```

## Tech Stack

- **Backend**: C#, ASP.NET Core Web API, .NET 10
- **ORM**: Entity Framework Core 10, Npgsql EF Core provider
- **Database**: PostgreSQL 17 (via Docker Compose)
- **Frontend**: React + TypeScript + Vite (planned)

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Setup

1. Clone the repository and navigate to the project root.

2. Copy the example environment file and set your password:
   ```cmd
   copy .env.example .env
   # Edit .env and replace "replace_with_a_local_password" with a strong password
   ```

3. Start PostgreSQL:
   ```cmd
   docker compose up -d
   ```

4. Restore and build:
   ```cmd
   cd backend\JeffoyAutoAndMotorShop.Api
   dotnet restore
   dotnet build
   ```

5. Set the connection string via user secrets (replace `YOUR_PASSWORD` with the password from `.env`):
   ```cmd
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=jaams_db;Username=jaams_admin;Password=YOUR_PASSWORD"
   ```

6. Run the API:
   ```cmd
   dotnet run
   ```

7. Verify: `curl http://localhost:5122/health/database`

See the [Setup Cheatsheet](Development/Jeffoy%20Auto%20and%20Shop%20Setup%20Cheatsheet.md) for detailed steps.