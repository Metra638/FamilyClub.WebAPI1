using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Category
    {
        public int Id { get; set; }

        public string CategoryName { get; set; } = default!;

        //public string? Slug { get; set; }

        public List<Product> Products { get; set; } = new();
    }
}
