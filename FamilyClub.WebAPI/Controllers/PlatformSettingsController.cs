using FamilyClub.BLL.DTOs.PlatformSettings;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PlatformSettingsController : ControllerBase
{
    private readonly IPlatformSettingsService _service;

    public PlatformSettingsController(IPlatformSettingsService service)
    {
        _service = service;
    }

    /// <summary>Public read — logo/banner/company info on user site.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PlatformSettingsDto>> Get(CancellationToken cancellationToken)
    {
        try
        {
            var settings = await _service.GetAsync(cancellationToken);
            return Ok(settings);
        }
        catch (OperationCanceledException)
        {
            return Ok(new PlatformSettingsDto());
        }
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlatformSettingsDto>> Update(
        [FromBody] PlatformSettingsDto dto,
        CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(dto, cancellationToken);
        return Ok(updated);
    }
}
