using JeffoyAutoAndMotorShop.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace JeffoyAutoAndMotorShop.Api.Data;

/// <summary>
/// This factory allows EF Core tools (like dotnet ef migrations) to create
/// a DbContext at design time without running the full application startup.
/// This is necessary because Program.cs throws if the connection string is missing.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddUserSecrets<Program>() // This won't work in all cases, so we also check environment
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // If no connection string found, use a fallback for migration creation
        // This allows migrations to be created even without full database configuration
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = "Host=localhost;Port=5432;Database=jaams_db;Username=jaams_admin;Password=placeholder";
        }

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
