using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Language
    {
        public int Id { get; set; }

        public string LanguageName { get; set; } = default!;

        public List<Product> Products { get; set; } = new();
    }
}
