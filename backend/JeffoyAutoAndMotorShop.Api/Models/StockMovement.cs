namespace JeffoyAutoAndMotorShop.Api.Models;

/// <summary>
/// Represents the type of stock movement in the audit trail.
/// </summary>
public enum StockMovementType
{
    /// <summary>
    /// Initial stock when a product is first created.
    /// </summary>
    OpeningStock = 1,

    /// <summary>
    /// Stock added through restocking or receiving goods.
    /// </summary>
    Restock = 2,

    /// <summary>
    /// Manual adjustment (positive or negative) not tied to a sale.
    /// </summary>
    Adjustment = 3,

    /// <summary>
    /// Stock deducted when a sale is completed.
    /// </summary>
    SaleDeduction = 4,

    /// <summary>
    /// Stock restored when a sale is voided.
    /// </summary>
    VoidRestoration = 5
}

/// <summary>
/// Represents a single change in inventory for a product.
/// Each stock movement is an immutable record of how the stock balance changed.
/// </summary>
public class StockMovement
{
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to the Product table.
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// Navigation property to the Product entity.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// The type of stock movement (OpeningStock, Restock, Adjustment, etc.).
    /// </summary>
    public StockMovementType MovementType { get; set; }

    /// <summary>
    /// The quantity change. Positive for additions, negative for deductions.
    /// </summary>
    public int QuantityChange { get; set; }

    /// <summary>
    /// The stock balance AFTER this movement was applied.
    /// This is a snapshot for easy verification and auditing.
    /// </summary>
    public int ResultingStockQuantity { get; set; }

    /// <summary>
    /// Optional reference to a related sale (when movement type is SaleDeduction or VoidRestoration).
    /// </summary>
    public int? SaleId { get; set; }

    /// <summary>
    /// Optional reference or reason for this movement (e.g., "Opening stock", "Damage adjustment").
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// When this movement was recorded (UTC).
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }
}