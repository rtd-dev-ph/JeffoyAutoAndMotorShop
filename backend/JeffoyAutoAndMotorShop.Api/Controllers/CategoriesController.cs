using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.DTOs.Category;
using JeffoyAutoAndMotorShop.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    /// <summary>
    /// GET /api/categories
    /// Returns all active categories.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllActive()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// GET /api/categories/all
    /// Returns all categories including inactive ones (for administrative purposes).
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var categories = await _context.Categories
            .Select(c => MapToDto(c))
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// GET /api/categories/{id}
    /// Returns a specific category by its ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Status = 404,
                Detail = $"No category exists with ID {id}."
            });
        }

        return Ok(MapToDto(category));
    }

    /// <summary>
    /// POST /api/categories
    /// Creates a new category.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateCategoryDto createDto)
    {
        // Check for duplicate name (case-insensitive)
        var nameExists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == createDto.Name.ToLower());

        if (nameExists)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Duplicate category name",
                Status = 409,
                Detail = $"A category named '{createDto.Name}' already exists."
            });
        }

        var category = new Category
        {
            Name = createDto.Name,
            Description = createDto.Description,
            IsActive = true
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var dto = MapToDto(category);
        return CreatedAtAction(
            nameof(GetById),
            routeValues: new { id = dto.Id },
            value: dto);
    }

    /// <summary>
    /// PUT /api/categories/{id}
    /// Updates an existing category.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateCategoryDto updateDto)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Status = 404,
                Detail = $"No category exists with ID {id}."
            });
        }

        // Check for duplicate name (excluding current category)
        var nameExists = await _context.Categories
            .Where(c => c.Id != id)
            .AnyAsync(c => c.Name.ToLower() == updateDto.Name.ToLower());

        if (nameExists)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Duplicate category name",
                Status = 409,
                Detail = $"A category named '{updateDto.Name}' already exists."
            });
        }

        category.Name = updateDto.Name;
        category.Description = updateDto.Description;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(category));
    }

    /// <summary>
    /// DELETE /api/categories/{id}
    /// Deactivates a category (soft delete).
    /// This prevents accidental data loss and preserves historical references.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Category not found",
                Status = 404,
                Detail = $"No category exists with ID {id}."
            });
        }

        if (!category.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Category already deactivated",
                Status = 400,
                Detail = $"Category '{category.Name}' (ID: {id}) is already inactive."
            });
        }

        // Check if category has active products
        var hasActiveProducts = category.Products.Any(p => p.IsActive);
        if (hasActiveProducts)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Cannot deactivate category with active products",
                Status = 409,
                Detail = "Please deactivate or reassign all active products in this category before deactivating it."
            });
        }

        // Soft delete - mark as inactive
        category.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Category '{category.Name}' has been deactivated.",
            categoryId = category.Id
        });
    }

    /// <summary>
    /// Maps a Category entity to a CategoryDto.
    /// </summary>
    private static CategoryDto MapToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        IsActive = category.IsActive
    };
}