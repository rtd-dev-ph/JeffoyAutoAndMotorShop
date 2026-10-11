namespace JeffoyAutoAndMotorShop.Api.DTOs.Product;

public class CreateProductDto
{
    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int CategoryId { get; set; }

    public decimal CostPrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int OpeningStock { get; set; }

    public int LowStockThreshold { get; set; } = 5;
}
