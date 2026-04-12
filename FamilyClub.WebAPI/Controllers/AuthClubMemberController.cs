using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthClubMemberController : ControllerBase
{
    private readonly IAuthClubMemberService _authService;

    public AuthClubMemberController(IAuthClubMemberService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ClubMemberReadDto>> Register([FromBody] RegisterClubMemberDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var registeredUser = await _authService.RegisterAsync(dto, cancellationToken);
            return Ok(registeredUser);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseClubMemberDTO>> Login([FromBody] LoginClubMemberDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var authResponse = await _authService.LoginAsync(dto, cancellationToken);
            return Ok(authResponse);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // POST: api/AuthclubMember/logout
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _authService.LogoutAsync(cancellationToken);
        return Ok(new { Message = "Logged out successfully." });
    }
}