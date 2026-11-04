namespace JeffoyAutoAndMotorShop.Api.Models;

public enum UserRole
{
    Cashier,
    Owner
}

public class User
{
    public int Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Cashier;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }
}
