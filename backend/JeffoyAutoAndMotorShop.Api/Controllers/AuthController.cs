using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.DTOs.Auth;
using JeffoyAutoAndMotorShop.Api.Models;
using JeffoyAutoAndMotorShop.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JeffoyAutoAndMotorShop.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext context, JwtService jwtService) : ControllerBase
{
    private readonly AppDbContext _context = context;
    private readonly JwtService _jwtService = jwtService;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { title = "Validation failed", detail = "Username and password are required." });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { title = "Invalid credentials", detail = "Username or password is incorrect." });
        }

        var (token, expiresAt) = _jwtService.GenerateToken(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt,
            Path = "/"
        };
        Response.Cookies.Append("auth_token", token, cookieOptions);

        return Ok(new LoginResponseDto
        {
            Token = token,
            ExpiresAtUtc = expiresAt,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role.ToString()
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Append("auth_token", string.Empty, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(-1),
            Path = "/"
        });
        return Ok(new { message = "Logged out" });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var username = User.Identity?.Name ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return Ok(new { username, role });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAtUtc = u.CreatedAtUtc,
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequestDto request)
    {
        if (request is null)
        {
            return BadRequest(new { title = "Validation failed", detail = "Request body is required." });
        }

        var username = request.Username?.Trim() ?? string.Empty;
        var email = request.Email?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;
        var roleText = request.Role?.Trim() ?? string.Empty;

        var errors = new List<string>();
        if (username.Length < 3) errors.Add("Username must be at least 3 characters.");
        if (!System.Text.RegularExpressions.Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$")) errors.Add("A valid email is required.");
        if (password.Length < 8) errors.Add("Password must be at least 8 characters.");
        if (!Enum.TryParse<UserRole>(roleText, ignoreCase: true, out var role) || !Enum.IsDefined(role))
        {
            errors.Add($"Role must be one of: {string.Join(", ", Enum.GetNames<UserRole>())}.");
        }

        if (errors.Count > 0)
        {
            return BadRequest(new { title = "Validation failed", detail = string.Join(" ", errors) });
        }

        var duplicate = await _context.Users.AnyAsync(u =>
            u.Username.ToLower() == username.ToLower() || u.Email.ToLower() == email.ToLower());
        if (duplicate)
        {
            return Conflict(new { title = "Duplicate user", detail = "A user with the same username or email already exists." });
        }

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAtUtc = user.CreatedAtUtc,
        });
    }
}
