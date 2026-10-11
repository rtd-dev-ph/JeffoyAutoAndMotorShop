using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.DTOs.Sale;
using JeffoyAutoAndMotorShop.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace JeffoyAutoAndMotorShop.Api.Services;

/// <summary>
/// Service for managing sales operations including checkout and sale voiding.
/// </summary>
public interface ISalesService
{
    /// <summary>
    /// Processes a checkout: validates products, checks stock, calculates totals,
    /// creates the sale and sale items, deducts inventory, and records stock movements.
    /// All operations are performed within a database transaction.
    /// </summary>
    Task<CheckoutResponseDto> ProcessCheckoutAsync(CheckoutDto checkoutDto);

    /// <summary>
    /// Gets all sales (completed only by default).
    /// </summary>
    Task<IEnumerable<SaleDto>> GetAllSalesAsync(bool includeVoided = false);

    /// <summary>
    /// Gets a specific sale by ID, including its items.
    /// </summary>
    Task<SaleDto?> GetSaleByIdAsync(int id);

    /// <summary>
    /// Voids a completed sale: restores inventory, records stock movements,
    /// and marks the sale as voided. Performed within a database transaction.
    /// </summary>
    Task<SaleDto> VoidSaleAsync(int id, string reason);

    /// <summary>
    /// Gets sales for a specific date (using Asia/Manila timezone).
    /// </summary>
    Task<IEnumerable<SaleDto>> GetSalesByDateAsync(DateOnly date, bool includeVoided = false);
}

public class SalesService(AppDbContext context) : ISalesService
{
    private readonly AppDbContext _context = context;

    // Define the Manila timezone for business date calculations
    private static readonly TimeZoneInfo ManilaTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById(
            OperatingSystem.IsWindows() ? "Singapore Standard Time" : "Asia/Manila");

    public async Task<CheckoutResponseDto> ProcessCheckoutAsync(CheckoutDto checkoutDto)
    {
        // Validate payment method
        if (!Enum.TryParse<PaymentMethod>(checkoutDto.PaymentMethod, true, out var paymentMethod))
        {
            throw new ArgumentException("Invalid payment method. Use 'Cash' or 'GCash'.");
        }

        if (checkoutDto.Items.Count == 0)
        {
            throw new ArgumentException("Cannot checkout with an empty cart.");
        }

        // Process the entire checkout within a transaction
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Step 1: Validate products and load fresh data from database
            var productIds = checkoutDto.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .OrderBy(p => p.Id)
                .ToListAsync();

            // Create a lookup for quick access
            var productDict = products.ToDictionary(p => p.Id);

            // Step 2: Validate each item
            foreach (var item in checkoutDto.Items)
            {
                if (!productDict.TryGetValue(item.ProductId, out var product))
                {
                    throw new KeyNotFoundException($"Product with ID {item.ProductId} not found.");
                }

                if (!product.IsActive)
                {
                    throw new InvalidOperationException(
                        $"Product '{product.Name}' (SKU: {product.SKU}) is inactive and cannot be sold.");
                }

                if (item.Quantity <= 0)
                {
                    throw new ArgumentException(
                        $"Quantity for product '{product.Name}' must be positive.");
                }

                if (item.Quantity > product.StockQuantity)
                {
                    throw new InvalidOperationException(
                        $"Insufficient stock for product '{product.Name}' (SKU: {product.SKU}). " +
                        $"Available: {product.StockQuantity}, Requested: {item.Quantity}");
                }
            }

            // Step 3: Calculate line totals and grand total
            // IMPORTANT: We calculate this on the server using the database prices,
            // not trusting any values sent from the frontend
            var lineTotals = new List<decimal>();
            foreach (var item in checkoutDto.Items)
            {
                var product = productDict[item.ProductId];
                var lineTotal = product.SellingPrice * item.Quantity;
                lineTotals.Add(lineTotal);
            }
            var grandTotal = lineTotals.Sum();

            // Step 4: Generate sale number
            var saleNumber = await GenerateSaleNumberAsync();

            // Step 5: Create the sale header
            var sale = new Sale
            {
                SaleNumber = saleNumber,
                PaymentMethod = paymentMethod,
                Status = SaleStatus.Completed,
                GrandTotal = grandTotal,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync(); // Save to get the SaleId

            // Step 6: Create sale items with price snapshots and deduct stock
            foreach (var item in checkoutDto.Items)
            {
                var product = productDict[item.ProductId];

                // Deduct stock
                product.StockQuantity -= item.Quantity;
                product.UpdatedAtUtc = DateTime.UtcNow;

                // Create sale item with price snapshots (not references to current prices)
                var saleItem = new SaleItem
                {
                    SaleId = sale.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.SellingPrice,  // Snapshot at time of sale
                    UnitCost = product.CostPrice,      // Snapshot at time of sale
                    LineTotal = product.SellingPrice * item.Quantity
                };

                _context.SaleItems.Add(saleItem);

                // Record stock movement for the sale deduction
                var stockMovement = new StockMovement
                {
                    ProductId = product.Id,
                    MovementType = StockMovementType.SaleDeduction,
                    QuantityChange = -item.Quantity, // Negative for deductions
                    ResultingStockQuantity = product.StockQuantity,
                    SaleId = sale.Id,
                    Reference = $"Sale deduction for sale #{sale.Id}",
                    CreatedAtUtc = DateTime.UtcNow
                };

                _context.StockMovements.Add(stockMovement);
            }

            await _context.SaveChangesAsync();

            // Step 7: Commit the transaction
            await transaction.CommitAsync();

            // Build and return the response
            return await BuildCheckoutResponseAsync(sale, checkoutDto.Items);
        }
        catch
        {
            // Rollback transaction if any exception occurs
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<SaleDto>> GetAllSalesAsync(bool includeVoided = false)
    {
        var query = _context.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.Product)
            .AsQueryable();

        if (!includeVoided)
        {
            query = query.Where(s => s.Status == SaleStatus.Completed);
        }

        var sales = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .ToListAsync();

        return sales.Select(s => MapToDto(s));
    }

    public async Task<SaleDto?> GetSaleByIdAsync(int id)
    {
        var sale = await _context.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        return sale != null ? MapToDto(sale) : null;
    }

    public async Task<SaleDto> VoidSaleAsync(int id, string reason)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Load the sale with its items
            var sale = await _context.Sales
                .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                throw new KeyNotFoundException($"Sale with ID {id} not found.");
            }

            // Verify the sale is eligible to be voided
            if (sale.Status != SaleStatus.Completed)
            {
                throw new InvalidOperationException(
                    $"Sale #{sale.SaleNumber} cannot be voided. Current status: {sale.Status}.");
            }

            // Step 1: Restore inventory for each sale item
            foreach (var item in sale.SaleItems)
            {
                var product = item.Product;
                product.StockQuantity += item.Quantity;
                product.UpdatedAtUtc = DateTime.UtcNow;

                // Record stock restoration movement
                var restorationMovement = new StockMovement
                {
                    ProductId = product.Id,
                    MovementType = StockMovementType.VoidRestoration,
                    QuantityChange = item.Quantity,
                    ResultingStockQuantity = product.StockQuantity,
                    SaleId = sale.Id,
                    Reference = $"Stock restoration from voided sale #{sale.Id}",
                    CreatedAtUtc = DateTime.UtcNow
                };

                _context.StockMovements.Add(restorationMovement);
            }

            // Step 2: Update sale status
            sale.Status = SaleStatus.Voided;
            sale.VoidedAtUtc = DateTime.UtcNow;
            sale.VoidReason = reason;

            await _context.SaveChangesAsync();

            // Step 3: Commit transaction
            await transaction.CommitAsync();

            // Reload the sale with updated data
            await _context.Entry(sale).Collection(s => s.SaleItems).LoadAsync();
            foreach (var item in sale.SaleItems)
            {
                await _context.Entry(item).Reference(si => si.Product).LoadAsync();
            }

            return MapToDto(sale);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<SaleDto>> GetSalesByDateAsync(DateOnly date, bool includeVoided = false)
    {
        // Convert the Philippine business date to UTC date range
        // The date passed is already in the Asia/Manila timezone
        // We need to find sales that occurred within that business day in Manila time
        // Manila is UTC+8

        var startOfDate = date.ToDateTime(TimeOnly.MinValue);
        var endOfDate = date.ToDateTime(TimeOnly.MaxValue);

        // Convert Manila date boundaries to UTC
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(startOfDate, ManilaTimeZone);
        var endUtc = TimeZoneInfo.ConvertTimeToUtc(endOfDate, ManilaTimeZone);

        var query = _context.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.Product)
            .Where(s => s.CreatedAtUtc >= startUtc && s.CreatedAtUtc <= endUtc);

        if (!includeVoided)
        {
            query = query.Where(s => s.Status == SaleStatus.Completed);
        }

        var sales = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .ToListAsync();

        return sales.Select(s => MapToDto(s));
    }

    /// <summary>
    /// Generates a unique sale number in the format SALE-{YYYYMM}-{NNNN}.
    /// </summary>
    private async Task<string> GenerateSaleNumberAsync()
    {
        // Get the count of sales this month to generate sequence
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var salesThisMonth = await _context.Sales
            .Where(s => s.CreatedAtUtc >= startOfMonth)
            .CountAsync();

        var sequence = salesThisMonth + 1;
        return $"SALE-{now:yyyyMM}-{sequence:D4}";
    }

    /// <summary>
    /// Builds the checkout response DTO with product information.
    /// </summary>
    private async Task<CheckoutResponseDto> BuildCheckoutResponseAsync(
        Sale sale, List<CheckoutItemDto> requestItems)
    {
        // Reload sale items with product data
        await _context.Entry(sale).Collection(s => s.SaleItems).LoadAsync();
        // Load Product for each SaleItem
        foreach (var item in sale.SaleItems)
        {
            await _context.Entry(item).Reference(si => si.Product).LoadAsync();
        }

        return new CheckoutResponseDto
        {
            SaleId = sale.Id,
            SaleNumber = sale.SaleNumber,
            GrandTotal = sale.GrandTotal,
            PaymentMethod = sale.PaymentMethod.ToString(),
            CreatedAtUtc = sale.CreatedAtUtc,
            Items = sale.SaleItems.Select(si => new SaleItemDto
            {
                ProductId = si.ProductId,
                ProductSKU = si.Product.SKU,
                ProductName = si.Product.Name,
                Quantity = si.Quantity,
                UnitPrice = si.UnitPrice,
                UnitCost = si.UnitCost,
                LineTotal = si.LineTotal
            }).ToList()
        };
    }

    /// <summary>
    /// Maps a Sale entity to a SaleDto.
    /// </summary>
    private static SaleDto MapToDto(Sale sale)
    {
        return new SaleDto
        {
            Id = sale.Id,
            SaleNumber = sale.SaleNumber,
            GrandTotal = sale.GrandTotal,
            PaymentMethod = sale.PaymentMethod.ToString(),
            Status = sale.Status.ToString(),
            CreatedAtUtc = sale.CreatedAtUtc,
            VoidedAtUtc = sale.VoidedAtUtc,
            VoidReason = sale.VoidReason,
            Items = sale.SaleItems?.Select(si => new SaleItemDto
            {
                ProductId = si.ProductId,
                ProductSKU = si.Product?.SKU ?? string.Empty,
                ProductName = si.Product?.Name ?? string.Empty,
                Quantity = si.Quantity,
                UnitPrice = si.UnitPrice,
                UnitCost = si.UnitCost,
                LineTotal = si.LineTotal
            }).ToList() ?? new List<SaleItemDto>()
        };
    }
}
