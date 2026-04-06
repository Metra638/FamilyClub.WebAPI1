using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FamilyClub.WebAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthorsController : ControllerBase
	{
		private readonly IAuthorService _authorService;

		public AuthorsController(IAuthorService authorService)
		{
			_authorService = authorService;
		}

		// GET: api/<AuthorsController>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<AuthorDTO>>> GetAll(CancellationToken cancellationToken)
		{
			var authors = await _authorService.GetAllAsync(cancellationToken);
			return Ok(authors);
		}

		// GET api/<AuthorsController>/5
		[HttpGet("{id:int}")]
		public async Task<ActionResult<AuthorDTO>> GetById(int id, CancellationToken cancellationToken)
		{
			var author = await _authorService.GetByIdAsync(id, cancellationToken);
			if (author is null)
			{
				return NotFound();
			}

			return Ok(author);
		}

		// POST api/<AuthorsController>
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] AuthorDTO dto, CancellationToken cancellationToken)
		{
			var createdAuthor = await _authorService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdAuthor.Id }, createdAuthor);
		}

		// PUT api/<AuthorsController>/5
		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] AuthorDTO dto, CancellationToken cancellationToken)
		{
			var updated = await _authorService.UpdateAsync(id, dto, cancellationToken);
			if (!updated)
			{
				return NotFound();
			}

			return NoContent();
		}

		// DELETE api/<AuthorsController>/5
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var deleted = await _authorService.DeleteAsync(id, cancellationToken);
			if (!deleted)
			{
				return NotFound();
			}

			return NoContent();
		}

	}
}
