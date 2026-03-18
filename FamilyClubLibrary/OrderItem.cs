using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public int OrderId { get; set; } // Foreign key to Order
        public Order Order { get; set; } = default!; // Back-reference

        public int ProductId { get; set; } // Foreign key to Product 
        public Product Product { get; set; } = default!;
    }
}
