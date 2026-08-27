using FamilyClub.BLL.DTOs.Review;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.EntityFrameworkCore;

namespace FamilyClub.BLL.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly FamilyClubContext _context;

    public ReviewService(
        IReviewRepository reviewRepository,
        IUnitOfWork unitOfWork,
        FamilyClubContext context)
    {
        _reviewRepository = reviewRepository;
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<ReviewDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await QueryListRows(_context.Reviews.AsNoTracking(), cancellationToken);
        return rows.Select(MapListRowToDto);
    }

    public async Task<ReviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var review = await _reviewRepository.GetByIdAsync(id, cancellationToken);
        return review is null ? null : MapToDto(review);
    }

    public async Task<ReviewDto> CreateAsync(ReviewDto dto, CancellationToken cancellationToken = default)
    {
        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = dto.UserId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = dto.CreatedAt == default ? DateTime.UtcNow : dto.CreatedAt,
            Approved = dto.Approved
        };

        await _reviewRepository.AddAsync(review, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(review);
    }

    public async Task<bool> UpdateAsync(int id, ReviewDto dto, CancellationToken cancellationToken = default)
    {
        var review = await _reviewRepository.GetByIdAsync(id, cancellationToken);
        if (review is null)
        {
            return false;
        }

        review.ProductId = dto.ProductId;
        review.UserId = dto.UserId;
        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.Approved = dto.Approved;

        _reviewRepository.Update(review);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var review = await _reviewRepository.GetByIdAsync(id, cancellationToken);
        if (review is null)
        {
            return false;
        }

        _reviewRepository.Delete(review);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<IEnumerable<ReviewDto>> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var rows = await QueryListRows(
            _context.Reviews.AsNoTracking().Where(r => r.UserId == userId),
            cancellationToken);
        return rows.Select(MapListRowToDto);
    }

    private static async Task<List<ReviewListRow>> QueryListRows(
        IQueryable<Review> query,
        CancellationToken cancellationToken)
    {
        return await query
            .AsSplitQuery()
            .Select(r => new ReviewListRow
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.ProductName,
                UserId = r.UserId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Approved = r.Approved,
                AuthorNames = r.Product.Authors.Select(a => a.AuthorName).ToList(),
                CoverImageId = r.Product.ProductImages
                    .OrderBy(i => i.Id)
                    .Select(i => (int?)i.Id)
                    .FirstOrDefault(),
                CoverImageName = r.Product.ProductImages
                    .OrderBy(i => i.Id)
                    .Select(i => i.ImageName)
                    .FirstOrDefault(),
                MemberName = r.ClubMember != null ? r.ClubMember.Name : null,
                MemberSurname = r.ClubMember != null ? r.ClubMember.Surname : null,
                MemberUserName = r.ClubMember != null ? r.ClubMember.UserName : null,
                MemberEmail = r.ClubMember != null ? r.ClubMember.Email : null,
                MemberAvatarData = r.ClubMember != null ? r.ClubMember.AvatarData : null,
            })
            .ToListAsync(cancellationToken);
    }

    private static ReviewDto MapListRowToDto(ReviewListRow row)
    {
        return new ReviewDto
        {
            Id = row.Id,
            ProductId = row.ProductId,
            ProductName = row.ProductName,
            UserId = row.UserId,
            UserAvatarData = row.MemberAvatarData is { Length: > 0 }
                ? Convert.ToBase64String(row.MemberAvatarData)
                : null,
            UserName = ResolveDisplayName(
                row.MemberName,
                row.MemberSurname,
                row.MemberUserName,
                row.MemberEmail),
            Rating = row.Rating,
            Comment = row.Comment,
            CreatedAt = row.CreatedAt,
            Approved = row.Approved,
            Authors = row.AuthorNames.Count > 0
                ? string.Join(", ", row.AuthorNames)
                : null,
            ProductImages = row.CoverImageId is null
                ? null
                : new List<ProductImageDto>
                {
                    new()
                    {
                        Id = row.CoverImageId.Value,
                        ImageName = row.CoverImageName ?? string.Empty,
                        ImageData = Array.Empty<byte>(),
                    },
                },
        };
    }

    private static ReviewDto MapToDto(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            ProductName = review.Product?.ProductName,
            UserId = review.UserId,
            UserAvatarData = review.ClubMember?.AvatarData is { Length: > 0 }
                ? Convert.ToBase64String(review.ClubMember.AvatarData)
                : null,
            UserName = ResolveDisplayName(
                review.ClubMember?.Name,
                review.ClubMember?.Surname,
                review.ClubMember?.UserName,
                review.ClubMember?.Email),
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            Approved = review.Approved,
            Authors = review.Product?.Authors != null
                ? string.Join(", ", review.Product.Authors.Select(a => a.AuthorName))
                : null,
            ProductImages = review.Product?.ProductImages?.Select(img => new ProductImageDto
            {
                Id = img.Id,
                ImageData = img.ImageData,
                ImageName = img.ImageName
            }).ToList()
        };
    }

    private static string ResolveDisplayName(
        string? name,
        string? surname,
        string? userName,
        string? email)
    {
        var fullName = $"{name} {surname}".Trim();

        if (!string.IsNullOrWhiteSpace(fullName) && fullName.ToLower() != "string")
        {
            return fullName;
        }

        if (!string.IsNullOrWhiteSpace(name) && name.ToLower() != "string")
        {
            return name;
        }

        if (!string.IsNullOrWhiteSpace(userName) && userName.ToLower() != "string")
        {
            return userName;
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            return email;
        }

        return "Анонім";
    }

    private sealed class ReviewListRow
    {
        public int Id { get; init; }
        public int ProductId { get; init; }
        public string? ProductName { get; init; }
        public string? UserId { get; init; }
        public double Rating { get; init; }
        public string? Comment { get; init; }
        public DateTime CreatedAt { get; init; }
        public bool Approved { get; init; }
        public List<string> AuthorNames { get; init; } = [];
        public int? CoverImageId { get; init; }
        public string? CoverImageName { get; init; }
        public string? MemberName { get; init; }
        public string? MemberSurname { get; init; }
        public string? MemberUserName { get; init; }
        public string? MemberEmail { get; init; }
        public byte[]? MemberAvatarData { get; init; }
    }
}
