using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClubMemberController : ControllerBase
{
    private readonly IClubMemberService _clubMemberService;

    public ClubMemberController(IClubMemberService clubMemberService)
    {
        _clubMemberService = clubMemberService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClubMemberReadDto>>> GetAll(CancellationToken cancellationToken)
    {
        var clubMembers = await _clubMemberService.GetAllAsync(cancellationToken);
        return Ok(clubMembers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClubMemberReadDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var clubMember = await _clubMemberService.GetByIdAsync(id, cancellationToken);
        if (clubMember is null)
        {
            return NotFound();
        }

        return Ok(clubMember);
    }

    [HttpGet("by-email/{email}")]
    public async Task<ActionResult<ClubMemberReadDto>> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var clubMember = await _clubMemberService.GetByEmailAsync(email, cancellationToken);
        if (clubMember is null)
        {
            return NotFound();
        }
        return Ok(clubMember);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterClubMemberDto dto, CancellationToken cancellationToken)
    {
        var createdClubMember = await _clubMemberService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdClubMember.Id }, createdClubMember);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateClubMemberDto dto, CancellationToken cancellationToken)
    {
        var updated = await _clubMemberService.UpdateAsync(id, dto, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var deleted = await _clubMemberService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}