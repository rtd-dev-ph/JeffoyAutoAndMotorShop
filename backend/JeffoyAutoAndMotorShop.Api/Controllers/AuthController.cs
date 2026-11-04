using JeffoyAutoAndMotorShop.Api.Data;
using JeffoyAutoAndMotorShop.Api.DTOs.Auth;
using JeffoyAutoAndMotorShop.Api.Models;
using JeffoyAutoAndMotorShop.Api.Services;
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

        return Ok(new LoginResponseDto
        {
            Token = token,
            ExpiresAtUtc = expiresAt,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role.ToString()
        });
    }
}
