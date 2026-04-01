using FamilyClub.BLL.DTOs.Language;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;


namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageService _languageService;

    public LanguagesController(ILanguageService languageService)
    {
        _languageService = languageService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LanguageDto>>> GetAll(CancellationToken cancellationToken)
    {
        var languages = await _languageService.GetAllAsync(cancellationToken);
        return Ok(languages);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LanguageDto>> GetById(int id, CancellationToken cancelletionToken)
    {
        var language = await _languageService.GetByIdAsync(id, cancelletionToken);
        if (language is null)
        {
            return NotFound();
        }
        return Ok(language);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LanguageDto dto, CancellationToken cancellationToken)
    {
        var createdLanguage = await _languageService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdLanguage.Id }, createdLanguage);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] LanguageDto dto, CancellationToken cancellationToken)
    {
        var updated = await _languageService.UpdateAsync(id, dto, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _languageService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
