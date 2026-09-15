using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FamilyClub.DAL.EF;
using FamilyClubLibrary;
using Microsoft.EntityFrameworkCore;

namespace FamilyClub.WebAPI.Services;

public interface IInkBookEmbeddingService
{
    Task EnsureSchemaAsync(CancellationToken ct = default);
    Task<int> ReindexAsync(CancellationToken ct = default);
    Task<IReadOnlyList<(int ProductId, float Score)>> SearchAsync(
        string query,
        int take = 8,
        CancellationToken ct = default);
}

public class InkBookEmbeddingService : IInkBookEmbeddingService
{
    private readonly FamilyClubContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<InkBookEmbeddingService> _logger;

    public InkBookEmbeddingService(
        FamilyClubContext db,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<InkBookEmbeddingService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    private string OllamaBase =>
        (_config["InkAssistant:OllamaBaseUrl"] ?? "http://localhost:11434").TrimEnd('/');

    private string EmbeddingModel =>
        _config["InkAssistant:EmbeddingModel"] ?? "nomic-embed-text";

    public async Task EnsureSchemaAsync(CancellationToken ct = default)
    {
        // EnsureCreated не додає нові таблиці в уже існуючу БД — створюємо явно.
        await _db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS book_embeddings (
                product_id integer PRIMARY KEY,
                embedding_json text NOT NULL,
                source_hash character varying(64) NOT NULL,
                updated_at timestamptz NOT NULL DEFAULT NOW(),
                CONSTRAINT fk_book_embeddings_product
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
            """,
            ct);
    }

    public async Task<int> ReindexAsync(CancellationToken ct = default)
    {
        await EnsureSchemaAsync(ct);

        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Authors)
            .Include(p => p.Categories)
            .Select(p => new
            {
                p.Id,
                p.ProductName,
                p.OriginalTitle,
                p.Description,
                Authors = string.Join(", ", p.Authors.Select(a => a.AuthorName)),
                Categories = string.Join(", ", p.Categories.Select(c => c.CategoryName)),
            })
            .ToListAsync(ct);

        var existing = await _db.BookEmbeddings.ToDictionaryAsync(e => e.ProductId, ct);
        var updated = 0;

        foreach (var p in products)
        {
            ct.ThrowIfCancellationRequested();
            var sourceText = BuildSourceText(
                p.ProductName,
                p.OriginalTitle,
                p.Authors,
                p.Categories,
                p.Description);
            var hash = Sha256Hex(sourceText);

            if (existing.TryGetValue(p.Id, out var row) &&
                string.Equals(row.SourceHash, hash, StringComparison.Ordinal))
            {
                continue;
            }

            float[] vector;
            try
            {
                vector = await EmbedAsync(sourceText, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to embed product {ProductId}", p.Id);
                continue;
            }

            var json = JsonSerializer.Serialize(vector);
            if (row is null)
            {
                _db.BookEmbeddings.Add(new BookEmbedding
                {
                    ProductId = p.Id,
                    EmbeddingJson = json,
                    SourceHash = hash,
                    UpdatedAt = DateTimeOffset.UtcNow,
                });
            }
            else
            {
                row.EmbeddingJson = json;
                row.SourceHash = hash;
                row.UpdatedAt = DateTimeOffset.UtcNow;
            }

            updated++;
            if (updated % 10 == 0)
                await _db.SaveChangesAsync(ct);
        }

        await _db.SaveChangesAsync(ct);
        return updated;
    }

    public async Task<IReadOnlyList<(int ProductId, float Score)>> SearchAsync(
        string query,
        int take = 8,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return [];

        await EnsureSchemaAsync(ct);

        var count = await _db.BookEmbeddings.CountAsync(ct);
        if (count == 0)
            return [];

        float[] queryVec;
        try
        {
            queryVec = await EmbedAsync(query.Trim(), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Query embedding failed");
            return [];
        }

        var rows = await _db.BookEmbeddings.AsNoTracking().ToListAsync(ct);
        var scored = new List<(int ProductId, float Score)>(rows.Count);

        foreach (var row in rows)
        {
            float[]? vec;
            try
            {
                vec = JsonSerializer.Deserialize<float[]>(row.EmbeddingJson);
            }
            catch
            {
                continue;
            }

            if (vec is null || vec.Length == 0)
                continue;

            var score = CosineSimilarity(queryVec, vec);
            if (score > 0.25f) // відсікаємо дуже слабкі збіги
                scored.Add((row.ProductId, score));
        }

        return scored
            .OrderByDescending(x => x.Score)
            .Take(take)
            .ToList();
    }

    private static string BuildSourceText(
        string name,
        string? originalTitle,
        string authors,
        string categories,
        string? description)
    {
        var desc = string.IsNullOrWhiteSpace(description)
            ? ""
            : description.Length > 800 ? description[..800] : description;

        return $"""
            Назва: {name}
            Оригінал: {originalTitle}
            Автори: {authors}
            Жанри: {categories}
            Опис: {desc}
            """.Trim();
    }

    private async Task<float[]> EmbedAsync(string text, CancellationToken ct)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(60);

        // Ollama /api/embeddings
        using var response = await client.PostAsJsonAsync(
            $"{OllamaBase}/api/embeddings",
            new { model = EmbeddingModel, prompt = text },
            ct);

        response.EnsureSuccessStatusCode();
        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

        if (!doc.RootElement.TryGetProperty("embedding", out var embEl) ||
            embEl.ValueKind != JsonValueKind.Array)
        {
            throw new InvalidOperationException("Ollama embeddings response missing 'embedding' array.");
        }

        var list = new List<float>(embEl.GetArrayLength());
        foreach (var n in embEl.EnumerateArray())
            list.Add(n.GetSingle());

        return list.ToArray();
    }

    private static float CosineSimilarity(float[] a, float[] b)
    {
        var len = Math.Min(a.Length, b.Length);
        if (len == 0) return 0f;

        double dot = 0, na = 0, nb = 0;
        for (var i = 0; i < len; i++)
        {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }

        var denom = Math.Sqrt(na) * Math.Sqrt(nb);
        if (denom < 1e-12) return 0f;
        return (float)(dot / denom);
    }

    private static string Sha256Hex(string text)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(text));
        return Convert.ToHexString(bytes);
    }
}
