using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.DTOs.Product;
using JeffoyAutoAndMotorShop.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    /// <summary>
    /// GET /api/products
    /// Returns all active products.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllActive()
    {
        var products = await _context.Products
            .Where(p => p.IsActive)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    /// <summary>
    /// GET /api/products/all
    /// Returns all products including inactive ones (administrative use).
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var products = await _context.Products
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    /// <summary>
    /// GET /api/products/low-stock
    /// Returns active products currently at or below their low-stock threshold.
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStock()
    {
        var products = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    /// <summary>
    /// GET /api/products/{id}
    /// Returns a specific product by its ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Status = 404,
                Detail = $"No product exists with ID {id}."
            });
        }

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// GET /api/products/sku/{sku}
    /// Returns a specific product by its SKU.
    /// </summary>
    [HttpGet("sku/{sku}")]
    public async Task<ActionResult<ProductDto>> GetBySku(string sku)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.SKU == sku);

        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Status = 404,
                Detail = $"No product exists with SKU '{sku}'."
            });
        }

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// POST /api/products
    /// Creates a new product.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto createDto)
    {
        // --- SKU validation ---
        if (string.IsNullOrWhiteSpace(createDto.SKU))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "SKU is required",
                Status = 400,
                Detail = "The SKU field must not be empty."
            });
        }

        if (createDto.SKU.Length > 50)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "SKU too long",
                Status = 400,
                Detail = "The SKU must not exceed 50 characters."
            });
        }

        // Unique constraint on SKU is case-insensitive at the DB level;
        // check it explicitly here for a friendlier error message.
        var skuExists = await _context.Products
            .AnyAsync(p => p.SKU.ToLower() == createDto.SKU.ToLower());

        if (skuExists)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Duplicate SKU",
                Status = 409,
                Detail = $"A product with SKU '{createDto.SKU}' already exists."
            });
        }

        // --- Name validation ---
        if (string.IsNullOrWhiteSpace(createDto.Name))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product name is required",
                Status = 400,
                Detail = "The Name field must not be empty."
            });
        }

        if (createDto.Name.Length > 200)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product name too long",
                Status = 400,
                Detail = "The Name must not exceed 200 characters."
            });
        }

        // --- Description validation ---
        if (createDto.Description?.Length > 1000)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Description too long",
                Status = 400,
                Detail = "The Description must not exceed 1000 characters."
            });
        }

        // --- Category validation ---
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == createDto.CategoryId);

        if (category == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Status = 404,
                Detail = $"No category exists with ID {createDto.CategoryId}."
            });
        }

        if (!category.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Category is inactive",
                Status = 400,
                Detail = $"Category '{category.Name}' (ID: {createDto.CategoryId}) is inactive. " +
                         "Please activate the category or choose an active one."
            });
        }

        // --- Price validation ---
        if (createDto.CostPrice < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid cost price",
                Status = 400,
                Detail = "The CostPrice must not be negative."
            });
        }

        if (createDto.SellingPrice < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid selling price",
                Status = 400,
                Detail = "The SellingPrice must not be negative."
            });
        }

        if (createDto.SellingPrice < createDto.CostPrice)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Selling price below cost",
                Status = 400,
                Detail = "The SellingPrice must not be lower than the CostPrice."
            });
        }

        // --- Stock validation ---
        if (createDto.OpeningStock < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid opening stock",
                Status = 400,
                Detail = "The OpeningStock must not be negative."
            });
        }

        if (createDto.LowStockThreshold < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid low-stock threshold",
                Status = 400,
                Detail = "The LowStockThreshold must not be negative."
            });
        }

        var product = new Product
        {
            SKU = createDto.SKU,
            Name = createDto.Name,
            Description = createDto.Description,
            CategoryId = createDto.CategoryId,
            CostPrice = createDto.CostPrice,
            SellingPrice = createDto.SellingPrice,
            StockQuantity = createDto.OpeningStock,
            LowStockThreshold = createDto.LowStockThreshold,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var dto = MapToDto(product);
        return CreatedAtAction(
            nameof(GetById),
            routeValues: new { id = dto.Id },
            value: dto);
    }

    /// <summary>
    /// PUT /api/products/{id}
    /// Updates an existing product.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto updateDto)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Status = 404,
                Detail = $"No product exists with ID {id}."
            });
        }

        if (!product.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product is inactive",
                Status = 400,
                Detail = $"Product '{product.Name}' (ID: {id}) is deactivated. " +
                         "Please reactivate it before updating."
            });
        }

        // --- Name validation ---
        if (string.IsNullOrWhiteSpace(updateDto.Name))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product name is required",
                Status = 400,
                Detail = "The Name field must not be empty."
            });
        }

        if (updateDto.Name.Length > 200)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product name too long",
                Status = 400,
                Detail = "The Name must not exceed 200 characters."
            });
        }

        // --- Description validation ---
        if (updateDto.Description?.Length > 1000)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Description too long",
                Status = 400,
                Detail = "The Description must not exceed 1000 characters."
            });
        }

        // --- Category validation ---
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == updateDto.CategoryId);

        if (category == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Status = 404,
                Detail = $"No category exists with ID {updateDto.CategoryId}."
            });
        }

        if (!category.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Category is inactive",
                Status = 400,
                Detail = $"Category '{category.Name}' (ID: {updateDto.CategoryId}) is inactive. " +
                         "Please activate the category or choose an active one."
            });
        }

        // --- Price validation ---
        if (updateDto.CostPrice < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid cost price",
                Status = 400,
                Detail = "The CostPrice must not be negative."
            });
        }

        if (updateDto.SellingPrice < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid selling price",
                Status = 400,
                Detail = "The SellingPrice must not be negative."
            });
        }

        if (updateDto.SellingPrice < updateDto.CostPrice)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Selling price below cost",
                Status = 400,
                Detail = "The SellingPrice must not be lower than the CostPrice."
            });
        }

        // --- Low-stock threshold validation ---
        if (updateDto.LowStockThreshold < 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid low-stock threshold",
                Status = 400,
                Detail = "The LowStockThreshold must not be negative."
            });
        }

        product.Name = updateDto.Name;
        product.Description = updateDto.Description;
        product.CategoryId = updateDto.CategoryId;
        product.CostPrice = updateDto.CostPrice;
        product.SellingPrice = updateDto.SellingPrice;
        product.LowStockThreshold = updateDto.LowStockThreshold;
        product.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// DELETE /api/products/{id}
    /// Deactivates a product (soft delete).
    /// This prevents accidental data loss and preserves historical references.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Status = 404,
                Detail = $"No product exists with ID {id}."
            });
        }

        if (!product.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Product already deactivated",
                Status = 400,
                Detail = $"Product '{product.Name}' (ID: {id}) is already inactive."
            });
        }

        // Soft delete — mark as inactive
        product.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Product '{product.Name}' has been deactivated.",
            productId = product.Id
        });
    }

    /// <summary>
    /// Maps a Product entity to a ProductDto.
    /// </summary>
    private static ProductDto MapToDto(Product product) => new()
    {
        Id = product.Id,
        SKU = product.SKU,
        Name = product.Name,
        Description = product.Description,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name,
        CostPrice = product.CostPrice,
        SellingPrice = product.SellingPrice,
        StockQuantity = product.StockQuantity,
        LowStockThreshold = product.LowStockThreshold,
        IsActive = product.IsActive,
        CreatedAtUtc = product.CreatedAtUtc,
        UpdatedAtUtc = product.UpdatedAtUtc
    };
}
