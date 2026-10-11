
using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register application services.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Read the connection string from configuration/environment variables.
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured.");
}

// Register EF Core with PostgreSQL.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register application services
builder.Services.AddScoped<IStockMovementService, StockMovementService>();
builder.Services.AddScoped<ISalesService, SalesService>();

var app = builder.Build();


// Test database connectivity without exposing credentials.


app.MapGet("/health/database", async (
    AppDbContext db,
    ILogger<Program> logger) =>
{
    try
    {
        await db.Database.OpenConnectionAsync();
        await db.Database.CloseConnectionAsync();

        return Results.Ok(new
        {
            status = "healthy",
            database = "connected"
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database connectivity check failed.");

        return Results.Problem(
            title: "Database unavailable",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
