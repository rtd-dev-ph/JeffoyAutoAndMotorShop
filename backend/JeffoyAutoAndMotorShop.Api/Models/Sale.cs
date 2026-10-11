namespace JeffoyAutoAndMotorShop.Api.Models;

/// <summary>
/// Represents the payment method used for a sale.
/// </summary>
public enum PaymentMethod
{
    /// <summary>
    /// Cash payment.
    /// </summary>
    Cash = 1,

    /// <summary>
    /// GCash mobile payment.
    /// </summary>
    GCash = 2
}

/// <summary>
/// Represents the current status of a sale.
/// </summary>
public enum SaleStatus
{
    /// <summary>
    /// The sale has been completed and inventory has been deducted.
    /// </summary>
    Completed = 1,

    /// <summary>
    /// The sale has been voided and inventory has been restored.
    /// </summary>
    Voided = 2
}

/// <summary>
/// Represents a completed sale (the sale header).
/// Contains one or more SaleItems for the products sold.
/// </summary>
public class Sale
{
    public int Id { get; set; }

    /// <summary>
    /// Human-readable sale reference number (e.g., SALE-0001).
    /// </summary>
    public string SaleNumber { get; set; } = string.Empty;

    /// <summary>
    /// The payment method used (Cash or GCash).
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>
    /// Current status of the sale (Completed or Voided).
    /// </summary>
    public SaleStatus Status { get; set; } = SaleStatus.Completed;

    /// <summary>
    /// Total amount of all sale items.
    /// Stored as numeric(18,2) in the database via EF Core configuration.
    /// </summary>
    public decimal GrandTotal { get; set; }

    /// <summary>
    /// When the sale was completed (UTC).
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// When the sale was last updated (UTC).
    /// </summary>
    public DateTime? UpdatedAtUtc { get; set; }

    /// <summary>
    /// When the sale was voided, if applicable (UTC).
    /// </summary>
    public DateTime? VoidedAtUtc { get; set; }

    /// <summary>
    /// Reason for voiding the sale, if applicable.
    /// </summary>
    public string? VoidReason { get; set; }

    /// <summary>
    /// Collection of items in this sale.
    /// </summary>
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}

/// <summary>
/// Represents a single line item in a sale.
/// Stores price snapshots to preserve history even if product prices change.
/// </summary>
public class SaleItem
{
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to the Sale table.
    /// </summary>
    public int SaleId { get; set; }

    /// <summary>
    /// Navigation property to the Sale.
    /// </summary>
    public Sale Sale { get; set; } = null!;

    /// <summary>
    /// Foreign key to the Product table.
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// Navigation property to the Product.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// Quantity of this product sold.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Selling price at the time of sale (price snapshot).
    /// Stored as numeric(18,2) in the database via EF Core configuration.
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Cost price at the time of sale (cost snapshot for historical margin analysis).
    /// Stored as numeric(18,2) in the database via EF Core configuration.
    /// </summary>
    public decimal UnitCost { get; set; }

    /// <summary>
    /// Line total = UnitPrice * Quantity.
    /// Stored as numeric(18,2) in the database via EF Core configuration.
    /// </summary>
    public decimal LineTotal { get; set; }
}