using FamilyClub.BLL.DTOs.Series;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SeriesController : ControllerBase
{
    private readonly ISeriesService _seriesService;

    public SeriesController(ISeriesService seriesService)
    {
        _seriesService = seriesService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SeriesDto>>> GetAll(CancellationToken cancellationToken)
    {
        var series = await _seriesService.GetAllAsync(cancellationToken);
        return Ok(series);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SeriesDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var serie = await _seriesService.GetByIdAsync(id, cancellationToken);
        if (serie is null)
        {
            return NotFound();
        }

        return Ok(serie);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SeriesDto dto, CancellationToken cancellationToken)
    {
        var createdSerie = await _seriesService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdSerie.Id }, createdSerie);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SeriesDto dto, CancellationToken cancellationToken)
    {
        var updated = await _seriesService.UpdateAsync(id, dto, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _seriesService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}