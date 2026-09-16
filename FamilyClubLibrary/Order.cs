using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Order
    {
        public int Id { get; set; }

        public string UserId { get; set; } = default!;
        public ClubMember ClubMember { get; set; } = default!; // For navigation

        public DateTime OrderDate { get; set; } = DateTime.UtcNow; // Default Now 

        public string Status { get; set; } = "Pending";

        /// <summary>
        /// card_online | cash_on_delivery | card_dia (reserved)
        /// </summary>
        public string PaymentMethod { get; set; } = "card_online";

        public decimal TotalPrice { get; set; }
        // ─── Contact info ───
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? DeliveryProvider { get; set; }
        public string? DeliveryType { get; set; }
        public string? City { get; set; }
        public string? CityRef { get; set; }
        public string? Branch { get; set; }
        public string? BranchRef { get; set; }
        public decimal? DeliveryCost { get; set; }

        public string? Comment { get; set; }
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
