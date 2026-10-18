using JeffoyAutoAndMotorShop.Api.DTOs.Sale;

namespace JeffoyAutoAndMotorShop.Api.DTOs.Reports;

/// <summary>
/// Summary report for a single business day's sales.
/// </summary>
public class DailySalesReportDto
{
    /// <summary>
    /// The business date (Asia/Manila timezone).
    /// </summary>
    public DateOnly Date { get; set; }

    /// <summary>
    /// Number of completed sales transactions for this date.
    /// </summary>
    public int TransactionCount { get; set; }

    /// <summary>
    /// Total units sold across all transactions.
    /// </summary>
    public int TotalItemsSold { get; set; }

    /// <summary>
    /// Sum of all sale totals (completed only by default).
    /// </summary>
    public decimal TotalSales { get; set; }

    /// <summary>
    /// Total sales amount for Cash transactions.
    /// </summary>
    public decimal CashTotal { get; set; }

    /// <summary>
    /// Total sales amount for GCash transactions.
    /// </summary>
    public decimal GCashTotal { get; set; }

    /// <summary>
    /// List of all sales for this date (completed only by default).
    /// </summary>
    public List<SaleDto> Sales { get; set; } = new();
}