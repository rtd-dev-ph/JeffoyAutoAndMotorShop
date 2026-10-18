using System.ComponentModel.DataAnnotations;

namespace JeffoyAutoAndMotorShop.Api.DTOs.Sale;

/// <summary>
/// Represents a single item in a checkout request.
/// </summary>
public class CheckoutItemDto
{
    /// <summary>
    /// The product ID to sell.
    /// </summary>
    [Required(ErrorMessage = "ProductId is required")]
    [Range(1, int.MaxValue, ErrorMessage = "ProductId must be a positive integer")]
    public int ProductId { get; set; }

    /// <summary>
    /// The quantity of this product to sell.
    /// </summary>
    [Required(ErrorMessage = "Quantity is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
}

/// <summary>
/// Request DTO for creating a new sale (checkout).
/// The frontend sends the items and payment method; the backend validates stock,
/// calculates totals, and processes the sale atomically.
/// </summary>
public class CheckoutDto
    {
        /// <summary>
        /// List of products and quantities to sell.
        /// </summary>
        [Required(ErrorMessage = "Items list is required")]
        public List<CheckoutItemDto> Items { get; set; } = new();

        /// <summary>
        /// Payment method: "Cash" or "GCash".
        /// </summary>
        [Required(ErrorMessage = "PaymentMethod is required")]
        [StringLength(20, ErrorMessage = "PaymentMethod must not exceed 20 characters")]
        public string PaymentMethod { get; set; } = string.Empty;
    }

/// <summary>
/// Response DTO returned after a successful checkout.
/// </summary>
public class CheckoutResponseDto
{
    public int SaleId { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for individual sale items in responses.
/// </summary>
public class SaleItemDto
{
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal { get; set; }
}

/// <summary>
/// DTO for returning sale details.
/// </summary>
public class SaleDto
{
    public int Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? VoidedAtUtc { get; set; }
    public string? VoidReason { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for voiding a sale.
/// </summary>
public class VoidSaleDto
    {
        /// <summary>
        /// Required reason for voiding the sale.
        /// </summary>
        [Required(ErrorMessage = "Reason is required")]
        [StringLength(500, ErrorMessage = "Reason must not exceed 500 characters")]
        public string Reason { get; set; } = string.Empty;
    }