using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace FamilyClubLibrary
{
    public class ClubMember : IdentityUser
    {
        public string? Name { get; set; }

        public string? Surname { get; set; }

        public DateOnly? DateOfBirth { get; set; }
		
		public List<Order> Orders { get; set; } = new();


        public List<Review> Reviews { get; set; } = new();

		public List<Notification> Notifications { get; set; } = new();

        public byte[]? AvatarData { get; set; }
        public string? AvatarUrl { get; set; }
        public string? AvatarStorageKey { get; set; }
        public List<Product> FavoriteProducts { get; set; } = new();
        public List<Category> FavoriteCategories { get; set; } = new();
        // --- Блокування ---
        public int? BlockReasonId { get; set; }
        public string? LockoutComment { get; set; } // коментар адміна щодо конкретного блокування
        public BlockReason? BlockReason { get; set; }

        public DateTimeOffset? LockedAt { get; set; }

        public string? LockedById { get; set; }
        public ClubMember? LockedBy { get; set; }
    }
}
