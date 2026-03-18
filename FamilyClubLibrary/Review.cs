using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace FamilyClubLibrary
{
    public class Review
    {
        public int Id { get; set; }

        public int ProductId { get; set; } // Foreign key to Product
        public Product Product { get; set; } = default!; // Added naviagation

        public int UserId { get; set; }
        public User User { get; set; } = default!; // Added navigation

        [Range(0, 5)]
        public double Rating { get; set; } = 5; // Maximum by default

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to now

        public bool Approved { get; set; } = false; // Field to make sure that `Review` was checked by Admin
    }
}
