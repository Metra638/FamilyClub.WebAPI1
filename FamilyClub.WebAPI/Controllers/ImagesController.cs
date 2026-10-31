using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImagesController : ControllerBase
{
    private readonly IStorageService _storageService;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp"
    };

    public ImagesController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    /// <summary>
    /// Uploads an image to Cloudflare S3 / R2 storage.
    /// </summary>
    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Manager")]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? folder = "uploads", CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Файл не надано або він порожній." });
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = $"Неприпустимий формат файлу. Дозволені: {string.Join(", ", AllowedExtensions)}" });
        }

        if (!_storageService.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Cloudflare R2 (S3) сховище не налаштовано в appsettings.json."
            });
        }

        try
        {
            var url = await _storageService.UploadFileAsync(file, folder, cancellationToken);
            var key = _storageService.ExtractKey(url);

            return Ok(new
            {
                url,
                key,
                fileName = file.FileName,
                size = file.Length,
                contentType = file.ContentType
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "Помилка при завантаженні зображення в Cloudflare S3.",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Deletes an image from Cloudflare S3 / R2 storage.
    /// </summary>
    [HttpDelete]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete([FromBody] DeleteImageRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request?.UrlOrKey))
        {
            return BadRequest(new { message = "Потрібно вказати Url або Key файлу." });
        }

        var deleted = await _storageService.DeleteAsync(request.UrlOrKey, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = "Файл не знайдено або сховище не налаштовано." });
        }

        return NoContent();
    }
}

public class DeleteImageRequest
{
    public string UrlOrKey { get; set; } = string.Empty;
}

