using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyClubLibrary;

/// <summary>
/// Vector embedding of a product (book) for semantic search.
/// Stored as JSON float array so it works on local Windows Postgres without pgvector.
/// </summary>
public class BookEmbedding
{
    [Key]
    [ForeignKey(nameof(Product))]
    public int ProductId { get; set; }

    public Product? Product { get; set; }

    /// <summary>JSON array of floats from the embedding model.</summary>
    [Required]
    public string EmbeddingJson { get; set; } = "[]";

    /// <summary>Hash of the text that was embedded — skip rebuild if unchanged.</summary>
    [Required]
    [MaxLength(64)]
    public string SourceHash { get; set; } = "";

    public DateTimeOffset UpdatedAt { get; set; }
}
