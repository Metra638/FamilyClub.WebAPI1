using System;
using System.ComponentModel.DataAnnotations;

namespace FamilyClubLibrary
{
    public class ComplaintImage
    {
        public int Id { get; set; }

        public byte[]? ImageData { get; set; } = Array.Empty<byte>();

        [MaxLength(255)]
        public string ImageName { get; set; } = string.Empty;

        // Optional: store content type for proper display
        [MaxLength(50)]
        public string? ContentType { get; set; }

        public DateTime UploadedAt { get; set; }

        public string? ImageUrl { get; set; }
        public string? StorageKey { get; set; }

        // Foreign key to Complaint
        public int ComplaintId { get; set; }

        // Navigation property
        public Complaint Complaint { get; set; } = default!;
    }
}
