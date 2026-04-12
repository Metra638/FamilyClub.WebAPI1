using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace FamilyClub.BLL.Services;

public class AuthClubMemberService : IAuthClubMemberService
{
    private readonly UserManager<ClubMember> _userManager;
    private readonly IConfiguration _configuration;

    public AuthClubMemberService(UserManager<ClubMember> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
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

        return MapToReadDto(clubMember);
    }

    public async Task<AuthResponseClubMemberDTO> LoginAsync(LoginClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var clubMember = await _userManager.FindByEmailAsync(dto.Username);

        if (clubMember == null || !await _userManager.CheckPasswordAsync(clubMember, dto.Password))
        {
            throw new UnauthorizedAccessException("Wrong email or password!");
        }

        // Let's generate our token here and return it along with the user info
        var response =  GenerateJwtToken(clubMember, dto.RememberMe);
        response.ReturnUrl = dto.ReturnUrl;

        return response;
    }

    private AuthResponseClubMemberDTO GenerateJwtToken(ClubMember clubMember, bool rememberMe)
    {
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, clubMember.UserName ?? "Unknown"),
            new Claim(ClaimTypes.NameIdentifier, clubMember.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
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


        return new AuthResponseClubMemberDTO{
            ClubMember = MapToReadDto(clubMember as ClubMember),
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration 
        };
    }

    public Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        // While using JWT, logout is typically handled on the client side by simply deleting the token.
        return Task.CompletedTask;
    }

    // We always return ReadMapToReadDto to ensure consistent output format
    private static ClubMemberReadDto MapToReadDto(ClubMember clubMember)
    {
        return new ClubMemberReadDto
        {
            Id = clubMember.Id,
            Email = clubMember.Email ?? clubMember.UserName!,
            Name = clubMember.Name,
            Surname = clubMember.Surname,
            PhoneNumber = clubMember.PhoneNumber!,
            DateOfBirth = clubMember.DateOfBirth
        };
    }
}
