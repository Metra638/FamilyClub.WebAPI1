using FamilyClub.BLL.DTOs.Review;

namespace FamilyClub.BLL.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ReviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ReviewDto> CreateAsync(ReviewDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, ReviewDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReviewDto>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReviewDto>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);
}
