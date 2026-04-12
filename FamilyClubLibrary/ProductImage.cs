using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace FamilyClubLibrary
{
    public class ProductImage
    {
        public int Id { get; set; }
        public required byte[] ImageData { get; set; }

        [MaxLength(255)]
        public required string ImageName { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = default!;
    }
}