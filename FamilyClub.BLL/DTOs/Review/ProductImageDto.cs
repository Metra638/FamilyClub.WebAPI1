using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.Review
{
    public class ProductImageDto
    {
        public int Id { get; set; }
        public byte[] ImageData { get; set; } = [];
        public string ImageName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
