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

        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
