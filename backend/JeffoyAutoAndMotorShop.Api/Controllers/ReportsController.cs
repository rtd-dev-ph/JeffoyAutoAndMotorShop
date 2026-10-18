using JeffoyAutoAndMotorShop.Api.DTOs.Reports;
using JeffoyAutoAndMotorShop.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

/// <summary>
/// Controller for generated reports (sales summaries, etc.).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReportsController(ISalesService salesService) : ControllerBase
{
    private readonly ISalesService _salesService = salesService;

    /// <summary>
    /// GET /api/reports/daily-sales?date=2026-10-19&includeVoided=true
    /// Generates a daily sales summary report for the given date.
    /// The date is interpreted in Asia/Manila timezone (Philippine business date).
    /// If no date is provided, defaults to today's date in Manila timezone.
    /// </summary>
    [HttpGet("daily-sales")]
    public async Task<ActionResult<DailySalesReportDto>> GetDailySalesReport(
        [FromQuery] DateOnly? date = null,
        [FromQuery] bool includeVoided = false)
    {
        // Default to today's Manila date if none specified
        var reportDate = date ?? GetTodayInManila();

        try
        {
            var report = await _salesService.GenerateDailySalesReportAsync(reportDate, includeVoided);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ProblemDetails
            {
                Title = "An error occurred while generating the report",
                Status = 500,
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Gets today's date in the Asia/Manila timezone.
    /// Uses "Singapore Standard Time" on Windows (UTC+8) since "Asia/Manila"
    /// is not available there, and "Asia/Manila" on Linux.
    /// </summary>
    private static DateOnly GetTodayInManila()
    {
        var timeZoneId = OperatingSystem.IsWindows()
            ? "Singapore Standard Time"
            : "Asia/Manila";
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var nowManila = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
        return DateOnly.FromDateTime(nowManila.Date);
    }
}