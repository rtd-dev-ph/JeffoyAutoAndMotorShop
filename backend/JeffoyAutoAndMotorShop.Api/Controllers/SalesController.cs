using JeffoyAutoAndMotorShop.Api.DTOs.Sale;
using JeffoyAutoAndMotorShop.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController(ISalesService salesService) : ControllerBase
{
    private readonly ISalesService _salesService = salesService;

    /// <summary>
    /// POST /api/sales/checkout
    /// Processes a checkout: validates products, checks stock, calculates totals,
    /// creates the sale, deducts inventory, and records stock movements.
    /// All operations are atomic within a database transaction.
    /// </summary>
    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResponseDto>> Checkout([FromBody] CheckoutDto checkoutDto)
    {
        try
        {
            var response = await _salesService.ProcessCheckoutAsync(checkoutDto);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid request",
                Status = 400,
                Detail = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Checkout failed",
                Status = 400,
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// GET /api/sales
    /// Returns all completed sales.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetAll(bool includeVoided = false)
    {
        var sales = await _salesService.GetAllSalesAsync(includeVoided);
        return Ok(sales);
    }

    /// <summary>
    /// GET /api/sales/{id}
    /// Returns a specific sale by its ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SaleDto>> GetById(int id)
    {
        var sale = await _salesService.GetSaleByIdAsync(id);

        if (sale == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Sale not found",
                Status = 404,
                Detail = $"No sale exists with ID {id}."
            });
        }

        return Ok(sale);
    }

    /// <summary>
    /// GET /api/sales/date/{date}
    /// Returns sales for a specific date (using Asia/Manila business date).
    /// Returns only completed sales by default.
    /// </summary>
    [HttpGet("date/{date}")]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetByDate(
        DateOnly date,
        [FromQuery] bool includeVoided = false)
    {
        try
        {
            var sales = await _salesService.GetSalesByDateAsync(date, includeVoided);
            return Ok(sales);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ProblemDetails
            {
                Title = "An error occurred while retrieving sales",
                Status = 500,
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// POST /api/sales/{id}/void
    /// Voids a completed sale: restores inventory, records stock movements,
    /// and marks the sale as voided.
    /// </summary>
    [HttpPost("{id:int}/void")]
    public async Task<ActionResult<SaleDto>> Void(int id, [FromBody] VoidSaleDto voidDto)
    {
        if (string.IsNullOrWhiteSpace(voidDto.Reason))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Void reason required",
                Status = 400,
                Detail = "A reason must be provided when voiding a sale."
            });
        }

        try
        {
            var voidedSale = await _salesService.VoidSaleAsync(id, voidDto.Reason);
            return Ok(voidedSale);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Sale not found",
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Cannot void sale",
                Status = 400,
                Detail = ex.Message
            });
        }
    }
}