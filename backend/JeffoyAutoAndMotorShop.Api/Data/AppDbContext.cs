
using JeffoyAutoAndMotorShop.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JeffoyAutoAndMotorShop.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    public DbSet<Sale> Sales => Set<Sale>();

    public DbSet<SaleItem> SaleItems => Set<SaleItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

// Configuration for Category entity
public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        // Index for faster lookups by name
        builder.HasIndex(c => c.Name);
    }
}

// Configuration for Product entity
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        // Unique constraint on SKU - prevents duplicate SKUs (critical business rule)
        builder.HasIndex(p => p.SKU)
            .IsUnique();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.CategoryId)
            .IsRequired();

        // Configure foreign key relationship with Category
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete from category to products

        // Monetary columns with numeric(18,2) precision
        builder.Property(p => p.CostPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(p => p.SellingPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(p => p.StockQuantity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(p => p.LowStockThreshold)
            .IsRequired()
            .HasDefaultValue(5);

        builder.Property(p => p.IsActive)
            .HasDefaultValue(true);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.UpdatedAtUtc)
            .IsRequired();

        // Indexes for frequently searched fields
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.IsActive);
    }
}

// Configuration for StockMovement entity
public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements");

        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.ProductId)
            .IsRequired();

        // Configure foreign key relationship with Product
        builder.HasOne(sm => sm.Product)
            .WithMany()
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // Don't cascade delete movements if product is deleted

        builder.Property(sm => sm.MovementType)
            .IsRequired();

        // QuantityChange can be positive or negative
        builder.Property(sm => sm.QuantityChange)
            .IsRequired();

        builder.Property(sm => sm.ResultingStockQuantity)
            .IsRequired();

        // SaleId is optional (only set for SaleDeduction and VoidRestoration)
        builder.Property(sm => sm.SaleId)
            .IsRequired(false);

        builder.Property(sm => sm.Reference)
            .HasMaxLength(200);

        builder.Property(sm => sm.CreatedAtUtc)
            .IsRequired();

        // Indexes for common queries
        builder.HasIndex(sm => sm.ProductId);
        builder.HasIndex(sm => sm.MovementType);
        builder.HasIndex(sm => sm.CreatedAtUtc);
    }
}

// Configuration for Sale entity
public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.ToTable("Sales");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.SaleNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Unique constraint on SaleNumber
        builder.HasIndex(s => s.SaleNumber)
            .IsUnique();

        builder.Property(s => s.PaymentMethod)
            .IsRequired();

        builder.Property(s => s.Status)
            .IsRequired();

        // Monetary column with numeric(18,2) precision
        builder.Property(s => s.GrandTotal)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(s => s.CreatedAtUtc)
            .IsRequired();

        builder.Property(s => s.UpdatedAtUtc)
            .IsRequired(false);

        builder.Property(s => s.VoidedAtUtc)
            .IsRequired(false);

        builder.Property(s => s.VoidReason)
            .HasMaxLength(500)
            .IsRequired(false);

        // Indexes for common queries
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.CreatedAtUtc);
        builder.HasIndex(s => s.PaymentMethod);
    }
}

// Configuration for SaleItem entity
public class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
{
    public void Configure(EntityTypeBuilder<SaleItem> builder)
    {
        builder.ToTable("SaleItems");

        builder.HasKey(si => si.Id);

        builder.Property(si => si.SaleId)
            .IsRequired();

        // Configure foreign key relationship with Sale
        builder.HasOne(si => si.Sale)
            .WithMany(s => s.SaleItems)
            .HasForeignKey(si => si.SaleId)
            .OnDelete(DeleteBehavior.Cascade); // Cascades when a sale is deleted (though we won't delete)

        builder.Property(si => si.ProductId)
            .IsRequired();

        // Configure foreign key relationship with Product
        // Important: Use Restict to prevent accidental deletion of products with sales history
        builder.HasOne(si => si.Product)
            .WithMany()
            .HasForeignKey(si => si.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(si => si.Quantity)
            .IsRequired();

        // Monetary columns with numeric(18,2) precision
        builder.Property(si => si.UnitPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(si => si.UnitCost)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(si => si.LineTotal)
            .HasColumnType("numeric(18,2)")
            .IsRequired();
    }
}
