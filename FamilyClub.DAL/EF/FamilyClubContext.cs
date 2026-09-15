using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace FamilyClub.DAL.EF;
public class FamilyClubContext : IdentityDbContext<ClubMember>
{
    public FamilyClubContext(DbContextOptions<FamilyClubContext> options) : base(options) { }
	public DbSet<Format> ProductFormats { get; set; }
    public DbSet<AgeRestriction> AgeRestrictions { get; set; }
	public DbSet<BookSize> BookSizes { get; set; }
	public DbSet<Notification> Notifications { get; set; }
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

    public DbSet<Cart> Cart { get; set; }

    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Complaint> Complaints { get; set; }
    public DbSet<ComplaintImage> ComplaintImages { get; set; }
    public DbSet<BlockReason> BlockReasons { get; set; }
    public DbSet<BlockedIp> BlockedIps { get; set; }
    public DbSet<PlatformSettings> PlatformSettings { get; set; }
    public DbSet<ActionLog> ActionLogs { get; set; }
    public DbSet<ActionLogArchive> ActionLogArchives { get; set; }
    public DbSet<BookEmbedding> BookEmbeddings { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Mandatory for Identity
        base.OnModelCreating(builder);
		builder.Entity<ClubMember>()
		.Property(m => m.AvatarData)
		.HasColumnName("avatar_data");

        builder.Entity<ClubMember>()
        .HasMany(m => m.FavoriteProducts)
        .WithMany(p => p.FavoritedBy)
        .UsingEntity(j => j.ToTable("MemberFavoriteProducts"));

        builder.Entity<ClubMember>()
        .HasMany(m => m.FavoriteCategories)
        .WithMany(c => c.FavoritedBy)
        .UsingEntity(j => j.ToTable("MemberFavoriteCategories"));

        builder.Entity<ClubMember>()
       .HasOne(m => m.BlockReason)
       .WithMany(r => r.ClubMembers)
       .HasForeignKey(m => m.BlockReasonId)
       .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ClubMember>()
            .HasOne(m => m.LockedBy)
            .WithMany()
            .HasForeignKey(m => m.LockedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Many-to-Many: Product <-> Author
        builder.Entity<Product>()
            .HasMany(p => p.Authors)
            .WithMany(a => a.Products)
            .UsingEntity(j => j.ToTable("ProductAuthors"));

		builder.Entity<Product>()
	        .HasMany(p => p.Formats)
	        .WithMany(f => f.Products)
	        .UsingEntity(j => j.ToTable("ProductFormats"));

        builder.Entity<Product>()
            .HasMany(a => a.AgeRestrictions)
            .WithMany(p => p.Products)
            .UsingEntity(u => u.ToTable("ProductsAgeRestrictions"));

		builder.Entity<Product>()
			 .HasMany(b => b.BookSizes)
			 .WithMany(f => f.Products)
			 .UsingEntity(j => j.ToTable("ProductBookSizes"));

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
            .HasIndex(oi => new { oi.OrderId, oi.ProductId, oi.Format })
            .IsUnique();

        builder.Entity<ProductImage>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.ProductImages)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        //builder.Entity<Notification>()
        //.ToTable("notification");
        builder.Entity<Notification>()
               .HasOne(n => n.ClubMember)
               .WithMany(m => m.Notifications)
               .HasForeignKey(n => n.ClubMemberId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cart: one cart per ClubMember (or SessionId/GuestId)
        builder.Entity<Cart>()
			.HasIndex(c => c.ClubMemberId)
			.IsUnique();

		// CartItem: ensure a product format isn't duplicated in a cart
		builder.Entity<CartItem>()
			.HasIndex(ci => new { ci.CartId, ci.ProductId, ci.Format })
			.IsUnique();

		// Can be added:
		//// PRODUCT ↔ REVIEW (one-to-many)
		//builder.Entity<Product>()
		//    .HasMany(p => p.Reviews)
		//    .WithOne(r => r.Product)
		//    .HasForeignKey(r => r.ProductId);

		// USER ↔ ORDER (one-to-many)
		builder.Entity<Order>()
		    .HasOne(o => o.ClubMember)
		    .WithMany(m => m.Orders)
		    .HasForeignKey(o => o.UserId)
		    .OnDelete(DeleteBehavior.Cascade);

        //// USER ↔ REVIEW (one-to-many)
        //builder.Entity<Review>()
        //    .HasOne(r => r.ClubMember)
        //    .WithMany()
        //    .HasForeignKey(r => r.UserId);
        builder.Entity<Review>()
         .HasOne(r => r.ClubMember)
         .WithMany()
         .HasForeignKey(r => r.UserId)
         .IsRequired(false)
         .OnDelete(DeleteBehavior.SetNull);

        // For PROMOTIONS if we deside to change them to Many-to-Many
        // For the moment one product can have only one assigned promotion to avoid problems with pricing due to unexpected price reduce with multiple promotions summarizing.
        //// PROMOTION ↔ PRODUCT (many-to-many)
        //builder.Entity<Product>()
        //    .HasOne(p => p.Promotion)
        //    .WithMany(pr => pr.Products)
        //    .HasForeignKey(p => p.PromotionId)
        //    .OnDelete(DeleteBehavior.SetNull);

        // Configure Complaint - ComplaintImage relationship
        builder.Entity<Complaint>()
            .HasMany(c => c.ComplaintImages)
            .WithOne(ci => ci.Complaint)
            .HasForeignKey(ci => ci.ComplaintId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Complaint - ClubMember relationship
        builder.Entity<Complaint>()
            .HasOne(c => c.ClubMember)
            .WithMany()  // or WithMany(cm => cm.Complaints) if you add navigation property in ClubMember
            .HasForeignKey(c => c.ClubMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<BookEmbedding>(e =>
        {
            e.HasKey(x => x.ProductId);
            e.HasOne(x => x.Product)
                .WithOne()
                .HasForeignKey<BookEmbedding>(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

}
