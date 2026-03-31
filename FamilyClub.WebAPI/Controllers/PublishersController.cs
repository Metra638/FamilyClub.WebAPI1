using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PublishersController : ControllerBase
{
    private readonly IPublisherService _publisherService;

    public PublishersController(IPublisherService publisherService)
    {
        _publisherService = publisherService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublisherDto>>> GetAll(CancellationToken cancellationToken)
    {
        var publishers = await _publisherService.GetAllAsync(cancellationToken);
        return Ok(publishers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PublisherDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var publisher = await _publisherService.GetByIdAsync(id, cancellationToken);
        if (publisher is null)
        {
            return NotFound();
        }

        return Ok(publisher);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PublisherDto dto, CancellationToken cancellationToken)
    {
        var createdPublisher = await _publisherService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdPublisher.Id }, createdPublisher);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PublisherDto dto, CancellationToken cancellationToken)
    {
        var updated = await _publisherService.UpdateAsync(id, dto, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _publisherService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}