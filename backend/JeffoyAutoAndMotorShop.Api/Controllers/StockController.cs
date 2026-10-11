using JeffoyAutoAndMotorShop.Api.DTOs.StockMovement;
using JeffoyAutoAndMotorShop.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController(IStockMovementService stockService) : ControllerBase
{
    private readonly IStockMovementService _stockService = stockService;

    /// <summary>
    /// POST /api/stock/{productId}/opening
    /// Records opening stock for a product.
    /// This should be called when a product is first created with initial inventory.
    /// </summary>
    [HttpPost("{productId:int}/opening")]
    public async Task<IActionResult> RecordOpeningStock(int productId, [FromBody] OpeningStockDto dto)
    {
        try
        {
            var movement = await _stockService.RecordOpeningStockAsync(
                productId, dto.Quantity, dto.Reason);

            return Ok(new
            {
                message = $"Opening stock of {dto.Quantity} units recorded for product ID {productId}.",
                movementId = movement.Id,
                resultingStockQuantity = movement.ResultingStockQuantity
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid input",
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
    }

    /// <summary>
    /// POST /api/stock/{productId}/reorder
    /// Records a restock for a product.
    /// </summary>
    [HttpPost("{productId:int}/reorder")]
    public async Task<IActionResult> RecordRestock(int productId, [FromBody] AdjustStockDto dto)
    {
        try
        {
            var movement = await _stockService.RecordRestockAsync(
                productId, dto.Quantity, dto.Reason);

            return Ok(new
            {
                message = $"Restock of {dto.Quantity} units recorded for product ID {productId}.",
                movementId = movement.Id,
                resultingStockQuantity = movement.ResultingStockQuantity
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid input",
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
    }

    /// <summary>
    /// POST /api/stock/{productId}/adjust
    /// Records a manual inventory adjustment.
    /// Use positive values to add stock and negative values to remove stock.
    /// </summary>
    [HttpPost("{productId:int}/adjust")]
    public async Task<IActionResult> RecordAdjustment(int productId, [FromBody] AdjustStockDto dto)
    {
        try
        {
            var movement = await _stockService.RecordAdjustmentAsync(
                productId, dto.Quantity, dto.Reason);

            return Ok(new
            {
                message = $"Adjustment of {dto.Quantity} units recorded for product ID {productId}.",
                movementId = movement.Id,
                resultingStockQuantity = movement.ResultingStockQuantity
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid input",
                Status = 400,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Insufficient stock",
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
    }
}

/// <summary>
/// Controller for viewing stock movement history and current stock status.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class StockMovementsController(IStockMovementService stockService) : ControllerBase
{
    private readonly IStockMovementService _stockService = stockService;

    /// <summary>
    /// GET /api/stockmovements/product/{productId}
    /// Gets the stock movement history for a specific product.
    /// </summary>
    [HttpGet("product/{productId:int}")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetProductMovements(int productId)
    {
        var movements = await _stockService.GetProductMovementsAsync(productId);

        var dtos = movements.Select(m => new StockMovementDto
        {
            Id = m.Id,
            ProductId = m.ProductId,
            ProductName = m.Product?.Name ?? string.Empty,
            ProductSKU = m.Product?.SKU ?? string.Empty,
            MovementType = m.MovementType.ToString(),
            QuantityChange = m.QuantityChange,
            ResultingStockQuantity = m.ResultingStockQuantity,
            SaleId = m.SaleId,
            Reference = m.Reference,
            CreatedAtUtc = m.CreatedAtUtc
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// GET /api/stockmovements/all
    /// Gets all stock movements, optionally filtered by date range.
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetAllMovements(
        [FromQuery] DateTime? fromUtc, [FromQuery] DateTime? toUtc)
    {
        var movements = await _stockService.GetAllMovementsAsync(fromUtc, toUtc);

        var dtos = movements.Select(m => new StockMovementDto
        {
            Id = m.Id,
            ProductId = m.ProductId,
            ProductName = m.Product?.Name ?? string.Empty,
            ProductSKU = m.Product?.SKU ?? string.Empty,
            MovementType = m.MovementType.ToString(),
            QuantityChange = m.QuantityChange,
            ResultingStockQuantity = m.ResultingStockQuantity,
            SaleId = m.SaleId,
            Reference = m.Reference,
            CreatedAtUtc = m.CreatedAtUtc
        }).ToList();

        return Ok(dtos);
    }
}
