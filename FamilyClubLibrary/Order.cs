using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Order
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = default!; // For navigation

        public DateTime OrderDate { get; set; } = DateTime.UtcNow; // Default Now 

        public string Status { get; set; } = "Pending";

        public decimal TotalPrice { get; set; }

        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
