namespace JeffoyAutoAndMotorShop.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public decimal CostPrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int StockQuantity { get; set; }

    public int LowStockThreshold { get; set; } = 5;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
