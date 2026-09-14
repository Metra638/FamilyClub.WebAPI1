using FamilyClub.BLL.DTOs.Format;
using FamilyClub.BLL.DTOs.Review;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class FormatsController : ControllerBase
	{
		private readonly IFormatService _formatService;

		public FormatsController(IFormatService formatService)
		{
			_formatService = formatService;
		}

		// GET: api/formats
		[HttpGet]
		public async Task<ActionResult<IEnumerable<FormatDto>>> GetAll(CancellationToken cancellationToken)
		{
			try
			{
				var formats = await _formatService.GetAllAsync(cancellationToken);
				return Ok(formats);
			}
			catch (OperationCanceledException)
			{
				return Ok(Array.Empty<FormatDto>());
			}
		}

		// GET: api/formats/5
		[HttpGet("{id:int}")]
		public async Task<ActionResult<FormatDto>> GetById(int id, CancellationToken cancellationToken)
		{
			var formats = await _formatService.GetAllAsync(cancellationToken);
			var format = formats.FirstOrDefault(x => x.Id == id);

			if (format is null)
				return NotFound();

			return Ok(format);
		}

		// POST: api/formats
		[Authorize(Roles = "Admin,Manager")]
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] FormatDto dto, CancellationToken cancellationToken)
		{
			var createdFormat = await _formatService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdFormat.Id }, createdFormat);
		}


		[Authorize(Roles = "Admin,Manager")]
		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] FormatDto dto, CancellationToken cancellationToken)
		{
			var updated = await _formatService.UpdateAsync(id, dto, cancellationToken);
			if (!updated)
			{
				return NotFound();
			}

			return NoContent();
		}

		// DELETE: api/formats/5
		[Authorize(Roles = "Admin,Manager")]
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var deleted = await _formatService.DeleteAsync(id, cancellationToken);

			if (!deleted)
				return NotFound();

			return NoContent();
		}
	}
}
