using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace FamilyClubLibrary
{
    public class ProductImage
    {
        public int Id { get; set; }
        public byte[]? ImageData { get; set; } = Array.Empty<byte>();

        [MaxLength(255)]
        public required string ImageName { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = default!;

        public string? ImageUrl { get; set; }
        public string? StorageKey { get; set; }
    }
}
