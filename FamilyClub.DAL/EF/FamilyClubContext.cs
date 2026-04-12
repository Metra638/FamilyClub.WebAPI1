using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore;

namespace FamilyClub.DAL.EF;
public class FamilyClubContext : IdentityDbContext<ClubMember>
{
    public FamilyClubContext(DbContextOptions<FamilyClubContext> options) : base(options) { }
               

    public DbSet<Author> Authors { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<Language> Languages { get; set; }

    public DbSet<Order> Orders { get; set; }

    public DbSet<OrderItem> OrderItems { get; set; }

    public DbSet<Product> Products { get; set; }

    public DbSet<Promotion> Promotions { get; set; }

    public DbSet<Publisher> Publishers { get; set; }

    public DbSet<Review> Reviews { get; set; }

    public DbSet<Series> Series { get; set; }

    public DbSet<Translator> Translator { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Mandatory for Identity
        base.OnModelCreating(builder);

        // Many-to-Many: Product <-> Author
        builder.Entity<Product>()
            .HasMany(p => p.Authors)
            .WithMany(a => a.Products)
            .UsingEntity(j => j.ToTable("ProductAuthors"));


        // Many-to-Many: Product <-> Category
        builder.Entity<Product>()
            .HasMany(p => p.Categories)
            .WithMany(c => c.Products)
            .UsingEntity(j => j.ToTable("ProductCategories")); ;

        // Many-to-Many: Product <-> Series
        builder.Entity<Product>()
            .HasMany(p => p.Series)
            .WithMany(s => s.Products);

        // Many-to-Many: Product <-> Translator
        builder.Entity<Product>()
            .HasMany(p => p.Translators)
            .WithMany(t => t.Products)
            .UsingEntity(j => j.ToTable("ProductTranslators"));

        //Relationship: Language
        // We have BOTH Many-to-Many (Languages) and One-to-Many (OriginalLanguage)
        // We must define them explicitly so EF doesn't get confused.

        // Many-to-Many
        builder.Entity<Product>()
            .HasMany(p => p.Languages)
            .WithMany(l => l.Products);

        // One-to-Many (Original Language)
        builder.Entity<Product>()
            .HasOne(p => p.OriginalLanguage)
            .WithMany() // No collection in Language class for "OriginalProducts"
            .HasForeignKey(p => p.OriginalLanguageId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent circular cascade deletes
        // Other way on delete: .OnDelete(DeleteBehavior.SetNull);


        // OrderItem Composite Key (Optional but recommended)
        // To ensure a product isn't duplicated in an order:
        builder.Entity<OrderItem>()
            .HasIndex(oi => new { oi.OrderId, oi.ProductId })
            .IsUnique();

        builder.Entity<ProductImage>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.ProductImages)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Can be added:
        //// PRODUCT ↔ REVIEW (one-to-many)
        //builder.Entity<Product>()
        //    .HasMany(p => p.Reviews)
        //    .WithOne(r => r.Product)
        //    .HasForeignKey(r => r.ProductId);

        //// USER ↔ ORDER (one-to-many)
        //builder.Entity<Order>()
        //    .HasOne(o => o.ClubMember)
        //    .WithMany()
        //    .HasForeignKey(o => o.UserId);

        //// USER ↔ REVIEW (one-to-many)
        //builder.Entity<Review>()
        //    .HasOne(r => r.ClubMember)
        //    .WithMany()
        //    .HasForeignKey(r => r.UserId);


        // For PROMOTIONS if we deside to change them to Many-to-Many
        // For the moment one product can have only one assigned promotion to avoid problems with pricing due to unexpected price reduce with multiple promotions summarizing.
        //// PROMOTION ↔ PRODUCT (many-to-many)
        //builder.Entity<Product>()
        //    .HasOne(p => p.Promotion)
        //    .WithMany(pr => pr.Products)
        //    .HasForeignKey(p => p.PromotionId)
        //    .OnDelete(DeleteBehavior.SetNull);
    }

}
