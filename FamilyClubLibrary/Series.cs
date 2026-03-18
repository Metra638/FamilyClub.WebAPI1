using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Series
    {
        public int Id { get; set; }

        public string SerieTitle { get; set; } = default!;

        public List<Product> Products { get; set; } = new();
    }
}
