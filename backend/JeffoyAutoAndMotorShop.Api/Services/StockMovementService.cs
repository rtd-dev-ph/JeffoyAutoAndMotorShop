using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JeffoyAutoAndMotorShop.Api.Services;

/// <summary>
/// Service for managing stock movements and keeping the current stock balance
/// consistent with the movement history.
/// </summary>
public interface IStockMovementService
{
    /// <summary>
    /// Records opening stock for a product. 
    /// This sets the initial stock quantity and creates a movement record.
    /// </summary>
    Task<StockMovement> RecordOpeningStockAsync(int productId, int quantity, string? reason = null);

    /// <summary>
    /// Records a restock for a product (positive quantity change).
    /// Updates the product's StockQuantity and creates a movement record.
    /// </summary>
    Task<StockMovement> RecordRestockAsync(int productId, int quantity, string? reason = null);

    /// <summary>
    /// Records a manual adjustment for a product (can be positive or negative).
    /// Validates that the resulting quantity won't be negative.
    /// </summary>
    Task<StockMovement> RecordAdjustmentAsync(int productId, int quantity, string? reason = null);

    /// <summary>
    /// Records a stock deduction for a sale (negative quantity change).
    /// This is called within a transaction during checkout.
    /// </summary>
    Task<StockMovement> RecordSaleDeductionAsync(int productId, int quantity, int saleId, string? reason = null);

    /// <summary>
    /// Records a stock restoration when a sale is voided (positive quantity change).
    /// This is called within a transaction during sale voiding.
    /// </summary>
    Task<StockMovement> RecordVoidRestorationAsync(int productId, int quantity, int saleId, string? reason = null);

    /// <summary>
    /// Gets the movement history for a specific product.
    /// </summary>
    Task<IEnumerable<StockMovement>> GetProductMovementsAsync(int productId, DateTime? fromUtc = null, DateTime? toUtc = null);

    /// <summary>
    /// Gets all stock movements (optionally filtered by date range).
    /// </summary>
    Task<IEnumerable<StockMovement>> GetAllMovementsAsync(DateTime? fromUtc = null, DateTime? toUtc = null);
}

public class StockMovementService(AppDbContext context) : IStockMovementService
{
    private readonly AppDbContext _context = context;

    public async Task<StockMovement> RecordOpeningStockAsync(int productId, int quantity, string? reason = null)
    {
        if (quantity < 0)
            throw new ArgumentException("Opening stock quantity cannot be negative.", nameof(quantity));

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {productId} not found.");

        // Set the initial stock quantity
        product.StockQuantity = quantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            MovementType = StockMovementType.OpeningStock,
            QuantityChange = quantity,
            ResultingStockQuantity = quantity,
            Reference = reason ?? "Opening stock",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        // Reload the movement to get the generated Id
        await _context.Entry(movement).ReloadAsync();
        return movement;
    }

    public async Task<StockMovement> RecordRestockAsync(int productId, int quantity, string? reason = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Restock quantity must be positive.", nameof(quantity));

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {productId} not found.");

        // Update current stock balance
        product.StockQuantity += quantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            MovementType = StockMovementType.Restock,
            QuantityChange = quantity,
            ResultingStockQuantity = product.StockQuantity,
            Reference = reason ?? $"Restock of {quantity} units",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        await _context.Entry(movement).ReloadAsync();
        return movement;
    }

    public async Task<StockMovement> RecordAdjustmentAsync(int productId, int quantity, string? reason = null)
    {
        if (quantity == 0)
            throw new ArgumentException("Adjustment quantity cannot be zero.", nameof(quantity));

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {productId} not found.");

        var resultingQuantity = product.StockQuantity + quantity;

        if (resultingQuantity < 0)
            throw new InvalidOperationException(
                $"Cannot reduce stock below zero. Current stock: {product.StockQuantity}, " +
                $"requested change: {quantity}, resulting: {resultingQuantity}.");

        product.StockQuantity = resultingQuantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            MovementType = StockMovementType.Adjustment,
            QuantityChange = quantity,
            ResultingStockQuantity = resultingQuantity,
            Reference = reason ?? $"Manual adjustment of {quantity} units",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        await _context.Entry(movement).ReloadAsync();
        return movement;
    }

    public async Task<StockMovement> RecordSaleDeductionAsync(int productId, int quantity, int saleId, string? reason = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Sale deduction quantity must be positive.", nameof(quantity));

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {productId} not found.");

        var resultingQuantity = product.StockQuantity - quantity;

        if (resultingQuantity < 0)
            throw new InvalidOperationException(
                $"Insufficient stock. Current stock: {product.StockQuantity}, " +
                $"requested deduction: {quantity}, resulting: {resultingQuantity}.");

        product.StockQuantity = resultingQuantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            MovementType = StockMovementType.SaleDeduction,
            QuantityChange = -quantity, // Negative for deductions
            ResultingStockQuantity = resultingQuantity,
            SaleId = saleId,
            Reference = reason ?? $"Sale deduction for sale #{saleId}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        await _context.Entry(movement).ReloadAsync();
        return movement;
    }

    public async Task<StockMovement> RecordVoidRestorationAsync(int productId, int quantity, int saleId, string? reason = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Void restoration quantity must be positive.", nameof(quantity));

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new KeyNotFoundException($"Product with ID {productId} not found.");

        // Update current stock balance
        product.StockQuantity += quantity;
        product.UpdatedAtUtc = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            MovementType = StockMovementType.VoidRestoration,
            QuantityChange = quantity, // Positive for restoration
            ResultingStockQuantity = product.StockQuantity,
            SaleId = saleId,
            Reference = reason ?? $"Stock restoration from voided sale #{saleId}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        await _context.Entry(movement).ReloadAsync();
        return movement;
    }

    public async Task<IEnumerable<StockMovement>> GetProductMovementsAsync(int productId, DateTime? fromUtc = null, DateTime? toUtc = null)
    {
        var query = _context.StockMovements
            .Include(sm => sm.Product)
            .Where(sm => sm.ProductId == productId);

        if (fromUtc.HasValue)
            query = query.Where(sm => sm.CreatedAtUtc >= fromUtc.Value);

        if (toUtc.HasValue)
            query = query.Where(sm => sm.CreatedAtUtc <= toUtc.Value);

        return await query
            .OrderByDescending(sm => sm.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetAllMovementsAsync(DateTime? fromUtc = null, DateTime? toUtc = null)
    {
        var query = _context.StockMovements
            .Include(sm => sm.Product)
            .AsQueryable();

        if (fromUtc.HasValue)
            query = query.Where(sm => sm.CreatedAtUtc >= fromUtc.Value);

        if (toUtc.HasValue)
            query = query.Where(sm => sm.CreatedAtUtc <= toUtc.Value);

        return await query
            .OrderByDescending(sm => sm.CreatedAtUtc)
            .ToListAsync();
    }
}
