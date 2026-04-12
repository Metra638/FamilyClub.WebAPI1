using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace FamilyClubLibrary
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string ProductName { get; set; } = default!;

        [Required]
        public decimal Price { get; set; }

        public decimal? DiscountPrice { get; set; } // Nullable, if no discount exists?

        public string? Description { get; set; }

        // Publisher (one-to-many)
        public int? PublisherId { get; set; }
        public Publisher? Publisher { get; set; }

        public List<ProductImage>? ProductImages { get; set; } = new();

        public List<Review> Reviews { get; set; } = new(); // Navigation property for Review
        [NotMapped]
        public double Rating => Reviews?.Any() == true
            ? Reviews.Average(r => r.Rating) : 0;

        public string? OriginalTitle { get; set; }

        public int? PageCount { get; set; }

        // Authors (many-to-many)
        public List<Author> Authors { get; set; } = new();

        // Languages (many-to-many)
        public List<Language> Languages { get; set; } = new();

        public DateOnly? PublishingDate { get; set; }

        // Categories (many-to-many)
        public List<Category> Categories { get; set; } = new();

        // Series (many-to-many)
        public List<Series> Series { get; set; } = new();

        public string? Format { get; set; }

        // Original language (one-to-many)
        public int? OriginalLanguageId { get; set; }
        public Language? OriginalLanguage { get; set; }
        public string? ISBN { get; set; }

        // Promotion (one-to-many) (one Promotion per Product)
        public int? PromotionId { get; set; }
        public Promotion? Promotion { get; set; }


        public string? ProductCode { get; set; }

        public int? WeightGrams { get; set; }

        public int? ItemsInSet { get; set; }

        public string? AgeRestrictions { get; set; }

        // Translators (many-to-many)
        public List<Translator> Translators { get; set; } = new();

    }
}