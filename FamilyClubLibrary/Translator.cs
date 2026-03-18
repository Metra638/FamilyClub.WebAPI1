using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class Translator
    {
        public int Id { get; set; }

        public string TranslatorName { get; set; } = default!;

        public List<Product> Products { get; set; } = new();
    }
}
