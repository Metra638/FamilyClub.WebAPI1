using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Mapping;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;


using Microsoft.AspNetCore.Authentication;
using System.Net.Http.Json;

namespace FamilyClub.BLL.Services;

public class AuthClubMemberService : IAuthClubMemberService
{
    private const string ResetCacheKeyPrefix = "pwd-reset:";
    private const string ResetAttemptsKeyPrefix = "pwd-reset-attempts:";
    private const int MaxResetAttempts = 5;
    private static readonly TimeSpan ResetCodeTtl = TimeSpan.FromMinutes(15);

    private readonly UserManager<ClubMember> _userManager;
    private readonly SignInManager<ClubMember> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IEmailSender _emailSender;
    private readonly ICacheService _cache;
    private readonly ILogger<AuthClubMemberService> _logger;

    public AuthClubMemberService(
        UserManager<ClubMember> userManager,
        SignInManager<ClubMember> signInManager,
        IConfiguration configuration,
        RoleManager<IdentityRole> roleManager,
        IEmailSender emailSender,
        ICacheService cache,
        ILogger<AuthClubMemberService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _roleManager = roleManager;
        _emailSender = emailSender;
        _cache = cache;
        _logger = logger;
    }

    public async Task<ClubMemberReadDto> RegisterAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var clubMember = new ClubMember { UserName = dto.Email, Email = dto.Email, PhoneNumber = dto.PhoneNumber, Name = dto.Name, Surname = dto.Surname, DateOfBirth = dto.DateOfBirth };
        var result = await _userManager.CreateAsync(clubMember, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"User registration failed: {errors}");
        }

        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new IdentityRole("User"));
        }
        await _userManager.AddToRoleAsync(clubMember, "User");

        return ClubMemberMapper.MapToReadDto(clubMember);
    }

    public async Task<AuthResponseClubMemberDTO> LoginAsync(LoginClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var email = (dto.Username ?? string.Empty).Trim();
        var clubMember = string.IsNullOrEmpty(email)
            ? null
            : await _userManager.FindByEmailAsync(email);

        if (clubMember == null)
        {
            throw new UnauthorizedAccessException("Wrong email or password!");
        }

        if (await _userManager.IsLockedOutAsync(clubMember))
        {
            throw new UnauthorizedAccessException("Account is locked. Try again later.");
        }

        if (!await _userManager.CheckPasswordAsync(clubMember, dto.Password))
        {
            await _userManager.AccessFailedAsync(clubMember);
            throw new UnauthorizedAccessException("Wrong email or password!");
        }

        await _userManager.ResetAccessFailedCountAsync(clubMember);

        var response = await GenerateJwtTokenAsync(clubMember, dto.RememberMe);
        response.ReturnUrl = dto.ReturnUrl;

        return response;
    }

    private async Task<AuthResponseClubMemberDTO> GenerateJwtTokenAsync(
        ClubMember clubMember,
        bool rememberMe)
    {
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, clubMember.UserName ?? "Unknown"),
            new Claim(ClaimTypes.NameIdentifier, clubMember.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var roles = await _userManager.GetRolesAsync(clubMember);
        foreach (var role in roles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Secret Key is not configured.")));
        var expiration = rememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddHours(3);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            expires: expiration,
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return new AuthResponseClubMemberDTO
        {
            ClubMember = ClubMemberMapper.MapToReadDto(clubMember as ClubMember),
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration
        };
    }

    public Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public async Task<ClubMemberReadDto> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        var roles = await _userManager.GetRolesAsync(user);

        return new ClubMemberReadDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Surname = user.Surname,
            PhoneNumber = user.PhoneNumber,
            AvatarData = user.AvatarData,
            DateOfBirth = user.DateOfBirth,
            Roles = roles.ToList()
        };
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim();
        var user = await _userManager.FindByEmailAsync(email);

        // Always succeed outwardly — do not reveal whether the account exists.
        if (user == null)
        {
            _logger.LogInformation("Password reset requested for unknown email.");
            return;
        }

        var identityToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var code = RandomNumberGenerator.GetInt32(10000, 100000).ToString(); // 5 digits

        var cacheKey = ResetCacheKeyPrefix + email.ToLowerInvariant();
        await _cache.SetAsync(
            cacheKey,
            new PasswordResetCacheEntry
            {
                UserId = user.Id,
                Code = code,
                IdentityToken = identityToken,
            },
            ResetCodeTtl,
            cancellationToken);

        var html = $"""
            <p>Вітаємо!</p>
            <p>Код для відновлення пароля на Ink &amp; Echo:</p>
            <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">{code}</p>
            <p>Код дійсний 15 хвилин. Якщо ви не запитували відновлення — ігноруйте цей лист.</p>
            """;

        try
        {
            await _emailSender.SendAsync(
                email,
                "Код відновлення пароля — Ink & Echo",
                html,
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            throw new InvalidOperationException("Не вдалося надіслати лист. Спробуйте пізніше або зверніться до підтримки.");
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim();
        var cacheKey = ResetCacheKeyPrefix + email.ToLowerInvariant();
        var attemptsKey = ResetAttemptsKeyPrefix + email.ToLowerInvariant();

        var attempts = await _cache.GetAsync<int?>(attemptsKey, cancellationToken) ?? 0;
        if (attempts >= MaxResetAttempts)
        {
            throw new InvalidOperationException("Забагато спроб. Запросіть новий код.");
        }

        var entry = await _cache.GetAsync<PasswordResetCacheEntry>(cacheKey, cancellationToken);

        if (entry is null ||
            !string.Equals(entry.Code, dto.Code.Trim(), StringComparison.Ordinal))
        {
            await _cache.SetAsync(attemptsKey, attempts + 1, ResetCodeTtl, cancellationToken);
            throw new InvalidOperationException("Невірний або прострочений код.");
        }

        var user = await _userManager.FindByIdAsync(entry.UserId)
            ?? await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new InvalidOperationException("Невірний або прострочений код.");
        }

        var result = await _userManager.ResetPasswordAsync(user, entry.IdentityToken, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        await _cache.RemoveAsync(cacheKey, cancellationToken);
        await _cache.RemoveAsync(attemptsKey, cancellationToken);
    }

    public AuthenticationProperties GetExternalLoginProperties(string provider, string redirectUrl)
    {
        return _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
    }

    public async Task<AuthResponseClubMemberDTO> ExternalLoginCallbackAsync(CancellationToken cancellationToken = default)
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            throw new InvalidOperationException("Error loading external login information from provider.");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            throw new InvalidOperationException("Email claim not received from external login provider.");
        }

        var givenName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? info.Principal.FindFirstValue(ClaimTypes.Name) ?? "User";
        var surname = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "";

        var clubMember = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        if (clubMember == null)
        {
            clubMember = await _userManager.FindByEmailAsync(email);

            if (clubMember == null)
            {
                clubMember = new ClubMember
                {
                    UserName = email,
                    Email = email,
                    Name = givenName,
                    Surname = surname,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(clubMember);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new Exception($"User creation via external login failed: {errors}");
                }

                if (!await _roleManager.RoleExistsAsync("User"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("User"));
                }
                await _userManager.AddToRoleAsync(clubMember, "User");
            }

            var addLoginResult = await _userManager.AddLoginAsync(clubMember, info);
            if (!addLoginResult.Succeeded)
            {
                var errors = string.Join(", ", addLoginResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to link external login: {errors}");
            }
        }

        return await GenerateJwtTokenAsync(clubMember, rememberMe: true);
    }

    public async Task<AuthResponseClubMemberDTO> ExternalTokenLoginAsync(ExternalLoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Provider))
        {
            throw new ArgumentException("Provider is required.");
        }

        string email = string.Empty;
        string providerKey = string.Empty;
        string name = string.Empty;
        string surname = string.Empty;

        if (dto.Provider.Equals("Google", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(dto.IdToken))
                throw new ArgumentException("IdToken is required for Google login.");

            try
            {
                var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(dto.IdToken);
                email = payload.Email;
                providerKey = payload.Subject;
                name = payload.GivenName ?? payload.Name ?? "Google User";
                surname = payload.FamilyName ?? "";
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException($"Invalid Google token: {ex.Message}");
            }
        }
        else
        {
            throw new ArgumentException($"Unsupported provider '{dto.Provider}'.");
        }

        var clubMember = await _userManager.FindByLoginAsync(dto.Provider, providerKey);

        if (clubMember == null)
        {
            clubMember = await _userManager.FindByEmailAsync(email);

            if (clubMember == null)
            {
                clubMember = new ClubMember
                {
                    UserName = email,
                    Email = email,
                    Name = name,
                    Surname = surname,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(clubMember);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new Exception($"User creation failed: {errors}");
                }

                if (!await _roleManager.RoleExistsAsync("User"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("User"));
                }
                await _userManager.AddToRoleAsync(clubMember, "User");
            }

            var userLoginInfo = new UserLoginInfo(dto.Provider, providerKey, dto.Provider);
            var addLoginResult = await _userManager.AddLoginAsync(clubMember, userLoginInfo);
            if (!addLoginResult.Succeeded)
            {
                var errors = string.Join(", ", addLoginResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to link external login: {errors}");
            }
        }

        return await GenerateJwtTokenAsync(clubMember, rememberMe: true);
    }

    private sealed class PasswordResetCacheEntry
    {
        public string UserId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string IdentityToken { get; set; } = string.Empty;
    }
}
