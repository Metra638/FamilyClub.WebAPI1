using System.Security.Claims;
using FamilyClub.BLL.DTOs.Review;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAll(CancellationToken cancellationToken)
    {
        var reviews = await _reviewService.GetAllAsync(cancellationToken);
        return Ok(reviews);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ReviewDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var review = await _reviewService.GetByIdAsync(id, cancellationToken);
        if (review is null)
        {
            return NotFound();
        }

        return Ok(review);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] ReviewDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(dto.UserId))
        {
            dto.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        var createdReview = await _reviewService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdReview.Id }, createdReview);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] ReviewDto dto, CancellationToken cancellationToken)
    {
        var updated = await _reviewService.UpdateAsync(id, dto, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _reviewService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("by-user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByUser(string userId, CancellationToken cancellationToken)
    {
        var reviews = await _reviewService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(reviews);
    }

    [HttpGet("by-product/{productId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByProduct(int productId, CancellationToken cancellationToken)
    {
        var reviews = await _reviewService.GetByProductIdAsync(productId, cancellationToken);
        return Ok(reviews);
    }
}

