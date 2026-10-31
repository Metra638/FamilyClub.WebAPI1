using System.ComponentModel.DataAnnotations;

namespace FamilyClub.BLL.DTOs.Complaint
{
    public class ComplaintImageCreateDto
    {
        public byte[]? ImageData { get; set; }

        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string ImageName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ContentType { get; set; }
    }
}
