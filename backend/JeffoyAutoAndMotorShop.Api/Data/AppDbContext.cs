
using Microsoft.EntityFrameworkCore;

namespace JeffoyAutoAndMotorShop.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
}
