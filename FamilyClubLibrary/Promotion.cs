using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Promotion
    {
        public int Id { get; set; }

        public int? DiscountPercent { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public List<Product> Products { get; set; } = new(); // Promotion can apply to many products

    }
}
