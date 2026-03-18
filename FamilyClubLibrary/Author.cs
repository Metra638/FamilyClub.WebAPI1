namespace FamilyClubLibrary
{
    public class Author
    {
        public int Id { get; set; }

        public string AuthorName { get; set; } = default!;

        public string? Biography { get; set; }

        public string? PhotoUrl { get; set; }

        public List<Product> Products { get; set; } = new();
    }
}
