using FamilyClubLibrary;

namespace FamilyClub.BLL.DTOs.Product;

public class ProductDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = default!;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? Description { get; set; }
    public int? PublisherId { get; set; }
    public List<ProductImage>? ProductImages { get; set; } = new();
    public string? OriginalTitle { get; set; }
    public int? PageCount { get; set; }
    public DateOnly? PublishingDate { get; set; }
    public string? Format { get; set; }
    public int? OriginalLanguageId { get; set; }
    public string? ISBN { get; set; }
    public int? PromotionId { get; set; }
    public string? ProductCode { get; set; }
    public int? WeightGrams { get; set; }
    public int? ItemsInSet { get; set; }
    public string? AgeRestrictions { get; set; }
    public bool LeaveOldImages { get; set; }
}
