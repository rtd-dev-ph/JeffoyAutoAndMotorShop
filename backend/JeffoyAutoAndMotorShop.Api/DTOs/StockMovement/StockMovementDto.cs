using System.ComponentModel.DataAnnotations;

namespace JeffoyAutoAndMotorShop.Api.DTOs.StockMovement;

/// <summary>
/// DTO for requesting a stock adjustment (restock or manual adjustment).
/// </summary>
public class AdjustStockDto
{
    /// <summary>
    /// The quantity to adjust. 
    /// For restocking, use a positive value.
    /// For manual adjustments causing reduction, use a negative value.
    /// </summary>
    [Required(ErrorMessage = "Quantity is required")]
    public int Quantity { get; set; }

    /// <summary>
    /// Reason or reference for the adjustment (e.g., "Received shipment", "Damaged goods").
    /// </summary>
    [StringLength(200, ErrorMessage = "Reason must not exceed 200 characters")]
    public string? Reason { get; set; }
}

/// <summary>
/// DTO for returning stock movement information from the API.
/// </summary>
public class StockMovementDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public int QuantityChange { get; set; }
    public int ResultingStockQuantity { get; set; }
    public int? SaleId { get; set; }
    public string? Reference { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

/// <summary>
/// DTO for returning a product with its current stock information.
/// </summary>
public class ProductStockInfoDto
{
    public int Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => StockQuantity <= LowStockThreshold;
}

/// <summary>
/// DTO for recording opening stock when creating a product.
/// </summary>
public class OpeningStockDto
{
    /// <summary>
    /// The initial stock quantity for the product.
    /// </summary>
    [Required(ErrorMessage = "Quantity is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must not be negative")]
    public int Quantity { get; set; }

    /// <summary>
    /// Optional reason or reference for the opening stock entry.
    /// </summary>
    [StringLength(200, ErrorMessage = "Reason must not exceed 200 characters")]
    public string? Reason { get; set; }
}