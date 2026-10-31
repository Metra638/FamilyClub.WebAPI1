using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthorsController : ControllerBase
	{
		private readonly IAuthorService _authorService;
		private readonly IStorageService _storageService;

		public AuthorsController(IAuthorService authorService, IStorageService storageService)
		{
			_authorService = authorService;
			_storageService = storageService;
		}

		// GET: api/<AuthorsController>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<AuthorDTO>>> GetAll(CancellationToken cancellationToken)
		{
			try
			{
				var authors = await _authorService.GetAllAsync(cancellationToken);
				return Ok(authors);
			}
			catch (OperationCanceledException)
			{
				return Ok(Array.Empty<AuthorDTO>());
			}
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
		[Authorize(Roles = "Admin,Manager")]
		[HttpPost]
		[ProducesResponseType(typeof(AuthorDTO), StatusCodes.Status201Created)]
		public async Task<IActionResult> Create([FromBody] AuthorDTO dto, CancellationToken cancellationToken)
		{
			var createdAuthor = await _authorService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdAuthor.Id }, createdAuthor);
		}

		// PUT api/<AuthorsController>/5
		[Authorize(Roles = "Admin,Manager")]
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
		[Authorize(Roles = "Admin,Manager")]
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var author = await _authorService.GetByIdAsync(id, cancellationToken);
			if (author is null)
			{
				return NotFound();
			}

			if (!string.IsNullOrWhiteSpace(author.PhotoUrl))
			{
				await _storageService.DeleteAsync(author.PhotoUrl, cancellationToken);
			}

			var deleted = await _authorService.DeleteAsync(id, cancellationToken);
			if (!deleted)
			{
				return NotFound();
			}

			return NoContent();
		}

		// POST api/Authors/{id}/photo
		[Authorize(Roles = "Admin,Manager")]
		[HttpPost("{id:int}/photo")]
		public async Task<IActionResult> UploadPhoto(int id, IFormFile photo, CancellationToken cancellationToken)
		{
			if (photo == null || photo.Length == 0)
				return BadRequest("Файл не завантажено");

			var author = await _authorService.GetByIdAsync(id, cancellationToken);
			if (author is null)
				return NotFound();

			string photoUrl;
			if (_storageService.IsConfigured)
			{
				if (!string.IsNullOrWhiteSpace(author.PhotoUrl))
				{
					await _storageService.DeleteAsync(author.PhotoUrl, cancellationToken);
				}

				photoUrl = await _storageService.UploadFileAsync(photo, "authors", cancellationToken);
			}
			else
			{
				var uploadsFolder = Path.Combine("wwwroot", "images", "authors");
				Directory.CreateDirectory(uploadsFolder);

				var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
				var filePath = Path.Combine(uploadsFolder, fileName);

				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await photo.CopyToAsync(stream, cancellationToken);
				}

				photoUrl = $"/images/authors/{fileName}";
			}

			author.PhotoUrl = photoUrl;
			await _authorService.UpdateAsync(id, author, cancellationToken);

			return Ok(new { photoUrl });
		}
	}
}
