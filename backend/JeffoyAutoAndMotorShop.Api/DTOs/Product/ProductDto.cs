using System.ComponentModel.DataAnnotations;

namespace JeffoyAutoAndMotorShop.Api.DTOs.Product;

/// <summary>
/// DTO for creating a new product.
/// </summary>
public class CreateProductDto
{
    /// <summary>
    /// Stock Keeping Unit - must be unique.
    /// </summary>
    [Required(ErrorMessage = "SKU is required")]
    [StringLength(50, ErrorMessage = "SKU must not exceed 50 characters")]
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Product name.
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional product description.
    /// </summary>
    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Category ID the product belongs to.
    /// </summary>
    [Required(ErrorMessage = "CategoryId is required")]
    public int CategoryId { get; set; }

    /// <summary>
    /// Cost price in PHP.
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "CostPrice must not be negative")]
    public decimal CostPrice { get; set; }

    /// <summary>
    /// Selling price in PHP.
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "SellingPrice must not be negative")]
    public decimal SellingPrice { get; set; }

    /// <summary>
    /// Initial stock quantity (opening stock).
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "OpeningStock must not be negative")]
    public int OpeningStock { get; set; }

    /// <summary>
    /// Low stock threshold for alerts.
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "LowStockThreshold must not be negative")]
    public int LowStockThreshold { get; set; } = 5;

    /// <summary>
    /// Optional reason/reference for the opening stock entry.
    /// </summary>
    [StringLength(200, ErrorMessage = "OpeningStockReason must not exceed 200 characters")]
    public string? OpeningStockReason { get; set; }
}

/// <summary>
/// DTO for updating an existing product.
/// </summary>
public class UpdateProductDto
{
    /// <summary>
    /// Stock Keeping Unit - must be unique.
    /// </summary>
    [Required(ErrorMessage = "SKU is required")]
    [StringLength(50, ErrorMessage = "SKU must not exceed 50 characters")]
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Product name.
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional product description.
    /// </summary>
    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Category ID the product belongs to.
    /// </summary>
    [Required(ErrorMessage = "CategoryId is required")]
    public int CategoryId { get; set; }

    /// <summary>
    /// Cost price in PHP.
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "CostPrice must not be negative")]
    public decimal CostPrice { get; set; }

    /// <summary>
    /// Selling price in PHP.
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "SellingPrice must not be negative")]
    public decimal SellingPrice { get; set; }

    /// <summary>
    /// Low stock threshold for alerts.
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "LowStockThreshold must not be negative")]
    public int LowStockThreshold { get; set; } = 5;

    /// <summary>
    /// Whether the product is active.
    /// </summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for returning product data from the API.
/// </summary>
public class ProductDto
{
    /// <summary>
    /// Product ID.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Stock Keeping Unit.
    /// </summary>
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Product name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Product description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Category ID.
    /// </summary>
    public int CategoryId { get; set; }

    /// <summary>
    /// Category name (for convenience).
    /// </summary>
    public string? CategoryName { get; set; }

    /// <summary>
    /// Cost price in PHP.
    /// </summary>
    public decimal CostPrice { get; set; }

    /// <summary>
    /// Selling price in PHP.
    /// </summary>
    public decimal SellingPrice { get; set; }

    /// <summary>
    /// Current stock quantity.
    /// </summary>
    public int StockQuantity { get; set; }

    /// <summary>
    /// Low stock threshold for alerts.
    /// </summary>
    public int LowStockThreshold { get; set; }

    /// <summary>
    /// Whether the product is low in stock.
    /// </summary>
    public bool IsLowStock => StockQuantity <= LowStockThreshold;

    /// <summary>
    /// Whether the product is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Creation timestamp (UTC).
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// Last update timestamp (UTC).
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }
}

