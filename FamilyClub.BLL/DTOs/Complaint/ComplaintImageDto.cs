using System;

namespace FamilyClub.BLL.DTOs.Complaint
{
    public class ComplaintImageDto
    {
        public int Id { get; set; }
        public string ImageName { get; set; } = string.Empty;
        public string? ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
        public byte[]? ImageData { get; set; }
        public string? ImageUrl { get; set; }
    }
}
