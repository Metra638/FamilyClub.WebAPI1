using FamilyClubLibrary;
using FamilyClubLibrary.Enum;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

using Npgsql;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace FamilyClub.DAL.EF.DB
{
	public class SeedCatalogResult
	{
		public bool Success { get; set; }
		public string Message { get; set; } = "";
		public int AuthorsAdded { get; set; }
		public int AuthorsUpdated { get; set; }
		public int PublishersAdded { get; set; }
		public int CategoriesAdded { get; set; }
		public int ProductsAdded { get; set; }
		public int ProductsSkipped { get; set; }
		public int ProductsImagesUpdated { get; set; }
	}

	public class DbInitializer
	{
		private static readonly JsonSerializerOptions JsonOptions = new()
		{
			PropertyNameCaseInsensitive = true
		};

		public static async Task Initialize(
			IServiceProvider serviceProvider,
			IConfiguration configuration)
		{
			DbContextOptions<FamilyClubContext> options =
				serviceProvider.GetRequiredService<DbContextOptions<FamilyClubContext>>();

			using (FamilyClubContext context = new FamilyClubContext(options))
			{
                //await context.Database.EnsureCreatedAsync();
                var creator = context.GetService<IRelationalDatabaseCreator>();
                if (!await creator.ExistsAsync())
                {
                    try
                    {
                        await creator.CreateAsync(); // CREATE DATABASE
                    }
                    catch (PostgresException ex) when (ex.SqlState == "42P04")
                    {
                        // БД уже створена (інший под / Exists брехнув) — ігноруємо
                        Console.WriteLine("[DbInitializer] Database already exists (42P04) — continue.");
                    }
                }
                if (!await creator.HasTablesAsync())
                {
                    await creator.CreateTablesAsync();
                }

            }

            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
			var userManager = serviceProvider.GetRequiredService<UserManager<ClubMember>>();

			string[] roleNames = { "Admin", "User", "Manager" };
			foreach (var roleName in roleNames)
			{
				if (!await roleManager.RoleExistsAsync(roleName))
				{
					await roleManager.CreateAsync(new IdentityRole(roleName));
				}
			}

			var adminEmail = "admin@familyclub.com";
			var adminUser = await userManager.FindByEmailAsync(adminEmail);
			if (adminUser == null)
			{
				var admin = new ClubMember
				{
					UserName = adminEmail,
					Email = adminEmail,
					Name = "System",
					Surname = "Admin",
					EmailConfirmed = true,
					PhoneNumber = "0000000000",
					AvatarData = null
				};

				var result = await userManager.CreateAsync(admin, "{AdminFamilyClub*777!");
				if (result.Succeeded)
				{
					await userManager.AddToRoleAsync(admin, "Admin");
				}
			}

			var runSeedOnStartup = configuration.GetValue("Seed:RunOnStartup", true);
			if (!runSeedOnStartup)
			{
				Console.WriteLine("[DbInitializer] Seed:RunOnStartup=false — пропускаємо seed-catalog при старті.");
				return;
			}

			var seedResult = await SeedCatalogIdempotentAsync(serviceProvider, configuration);
			Console.WriteLine($"[DbInitializer] {seedResult.Message}");
		}

		/// <summary>
		/// Idempotent catalog seed: creates missing entities only (no DB wipe / no duplicates).
		/// </summary>
		public static async Task<SeedCatalogResult> SeedCatalogIdempotentAsync(
			IServiceProvider serviceProvider,
			IConfiguration configuration)
		{
			var result = new SeedCatalogResult();

			var imagesRoot = ResolveProductImagesRoot(configuration);
			if (imagesRoot is null)
			{
				result.Success = false;
				result.Message = "Папку product_images / seed-catalog.json не знайдено.";
				return result;
			}

			var catalogPath = Path.Combine(imagesRoot, "seed-catalog.json");
			if (!File.Exists(catalogPath))
			{
				result.Success = false;
				result.Message = $"Файл seed-catalog.json не знайдено: {catalogPath}";
				return result;
			}

			SeedCatalog? catalog;
			try
			{
				await using var stream = File.OpenRead(catalogPath);
				catalog = await JsonSerializer.DeserializeAsync<SeedCatalog>(stream, JsonOptions);
			}
			catch (Exception ex)
			{
				result.Success = false;
				result.Message = $"Помилка читання seed-catalog.json: {ex.Message}";
				return result;
			}

			if (catalog?.Books is null || catalog.Books.Count == 0)
			{
				result.Success = false;
				result.Message = "seed-catalog.json не містить книг.";
				return result;
			}

			await using var context = new FamilyClubContext(
				serviceProvider.GetRequiredService<DbContextOptions<FamilyClubContext>>());

			await NormalizeUkrainianTaxonomyAsync(context);

			var language = await EnsureLanguageAsync(context, "Українська");
			var formatPaper = await EnsureFormatAsync(context, "Паперова", "paper");
			var formatEbook = await EnsureFormatAsync(context, "Електронна", "ebook");
			var bookSize = await EnsureBookSizeAsync(context, "Стандарт", "standard");
			var ageAll = await EnsureAgeRestrictionAsync(context, "0+", "age0");

			// Deduplicate first: localization / repeated seeds can leave same AuthorName twice,
			// and ToDictionary would throw ArgumentException.
			await DeduplicateAuthorsByNameAsync(context);

			var authorsByName = (await context.Authors.ToListAsync())
				.GroupBy(a => a.AuthorName, StringComparer.OrdinalIgnoreCase)
				.ToDictionary(g => g.Key, g => g.OrderBy(a => a.Id).First(), StringComparer.OrdinalIgnoreCase);

			foreach (var seedAuthor in catalog.Authors ?? [])
			{
				if (string.IsNullOrWhiteSpace(seedAuthor.AuthorName))
				{
					continue;
				}

				var name = seedAuthor.AuthorName.Trim();
				if (!authorsByName.TryGetValue(name, out var author))
				{
					author = new Author
					{
						AuthorName = name,
						Biography = seedAuthor.Biography,
					};
					if (!string.IsNullOrWhiteSpace(seedAuthor.PhotoFile))
					{
						author.PhotoUrl = $"/images/product_images/{seedAuthor.PhotoFile.Replace('\\', '/')}";
					}

					context.Authors.Add(author);
					authorsByName[name] = author;
					result.AuthorsAdded++;
				}
				else
				{
					var changed = false;
					if (!string.IsNullOrWhiteSpace(seedAuthor.Biography)
						&& !string.Equals(author.Biography, seedAuthor.Biography, StringComparison.Ordinal))
					{
						author.Biography = seedAuthor.Biography;
						changed = true;
					}

					if (!string.IsNullOrWhiteSpace(seedAuthor.PhotoFile))
					{
						var photoUrl = $"/images/product_images/{seedAuthor.PhotoFile.Replace('\\', '/')}";
						// Re-apply on every seed so DB points at current on-disk author photos.
						author.PhotoUrl = photoUrl;
						changed = true;
					}

					if (changed)
					{
						result.AuthorsUpdated++;
					}
				}
			}

			await context.SaveChangesAsync();

			var publishersByName = (await context.Publishers.ToListAsync())
				.GroupBy(p => p.PublisherName, StringComparer.OrdinalIgnoreCase)
				.ToDictionary(g => g.Key, g => g.OrderBy(p => p.Id).First(), StringComparer.OrdinalIgnoreCase);

			var categoriesByName = (await context.Categories.ToListAsync())
				.GroupBy(c => c.CategoryName, StringComparer.OrdinalIgnoreCase)
				.ToDictionary(g => g.Key, g => g.OrderBy(c => c.Id).First(), StringComparer.OrdinalIgnoreCase);

			var existingProducts = await context.Products
				.Include(p => p.ProductImages)
				.ToListAsync();

			var existingByName = existingProducts
				.GroupBy(p => p.ProductName, StringComparer.OrdinalIgnoreCase)
				.ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
			var existingByIsbn = existingProducts
				.Where(p => !string.IsNullOrWhiteSpace(p.ISBN))
				.GroupBy(p => p.ISBN!.Trim(), StringComparer.OrdinalIgnoreCase)
				.ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

			var existingNames = new HashSet<string>(
				existingProducts.Select(p => p.ProductName),
				StringComparer.OrdinalIgnoreCase);
			var existingIsbns = new HashSet<string>(
				existingProducts
					.Where(p => !string.IsNullOrWhiteSpace(p.ISBN))
					.Select(p => p.ISBN!.Trim()),
				StringComparer.OrdinalIgnoreCase);

			var productsToAdd = new List<Product>();
			foreach (var book in catalog.Books)
			{
				if (string.IsNullOrWhiteSpace(book.ProductName))
				{
					continue;
				}

				var productName = book.ProductName.Trim();
				var isbn = string.IsNullOrWhiteSpace(book.Isbn) ? null : book.Isbn.Trim();

				Product? existingProduct = null;
				if (isbn is not null)
				{
					existingByIsbn.TryGetValue(isbn, out existingProduct);
				}
				if (existingProduct is null)
				{
					existingByName.TryGetValue(productName, out existingProduct);
				}

				if (existingProduct is not null)
				{
					var refreshed = await TryRefreshProductImagesAsync(existingProduct, book.ImageFiles, imagesRoot);
					if (refreshed)
					{
						result.ProductsImagesUpdated++;
					}
					else
					{
						result.ProductsSkipped++;
					}
					continue;
				}

				var publisherName = string.IsNullOrWhiteSpace(book.Publisher)
					? "Unknown Publisher"
					: book.Publisher.Trim();
				if (!publishersByName.TryGetValue(publisherName, out var publisher))
				{
					publisher = new Publisher { PublisherName = publisherName };
					context.Publishers.Add(publisher);
					publishersByName[publisherName] = publisher;
					result.PublishersAdded++;
				}

				var productCategories = new List<Category>();
				foreach (var categoryName in (book.Categories ?? []).Where(c => !string.IsNullOrWhiteSpace(c)).Take(3))
				{
					var catName = categoryName.Trim();
					if (catName.Length > 80)
					{
						catName = catName[..80];
					}

					if (!categoriesByName.TryGetValue(catName, out var category))
					{
						category = new Category { CategoryName = catName };
						context.Categories.Add(category);
						categoriesByName[catName] = category;
						result.CategoriesAdded++;
					}

					productCategories.Add(category);
				}

				if (productCategories.Count == 0)
				{
					const string fallback = "Художня література";
					if (!categoriesByName.TryGetValue(fallback, out var category))
					{
						category = new Category { CategoryName = fallback };
						context.Categories.Add(category);
						categoriesByName[fallback] = category;
						result.CategoriesAdded++;
					}

					productCategories.Add(category);
				}

				var productAuthors = new List<Author>();
				foreach (var authorName in book.Authors ?? [])
				{
					if (string.IsNullOrWhiteSpace(authorName))
					{
						continue;
					}

					if (authorsByName.TryGetValue(authorName.Trim(), out var author))
					{
						productAuthors.Add(author);
					}
				}

				var images = new List<ProductImage>();
				foreach (var relative in (book.ImageFiles ?? []).Take(5))
				{
					var fullPath = Path.Combine(imagesRoot, relative.Replace('/', Path.DirectorySeparatorChar));
					if (!File.Exists(fullPath))
					{
						continue;
					}

					images.Add(new ProductImage
					{
						ImageData = await File.ReadAllBytesAsync(fullPath),
						ImageName = Path.GetFileName(fullPath)
					});
				}

				var year = book.PublishingYear is >= 1900 and <= 2100 ? book.PublishingYear.Value : 2025;
				var product = new Product
				{
					ProductName = productName,
					OriginalTitle = book.OriginalTitle ?? productName,
					Description = book.Description,
					Price = book.Price > 0 ? book.Price : 399m,
					PageCount = book.PageCount is > 0 ? book.PageCount : 320,
					ISBN = isbn,
					PublishingDate = new DateOnly(year, 1, 1),
					Publisher = publisher,
					Authors = productAuthors,
					Categories = productCategories,
					Languages = new List<Language> { language },
					OriginalLanguage = language,
					Formats = new List<Format> { formatPaper, formatEbook },
					BookSizes = new List<BookSize> { bookSize },
					AgeRestrictions = new List<AgeRestriction> { ageAll },
					CoverType = CoverType.Hardcover,
					Availability = Availability.InStock,
					QuantityInStock = 25 + ((productsToAdd.Count + result.ProductsSkipped) % 40),
					ProductImages = images,
					WeightGrams = 350,
					ItemsInSet = 1
				};

				productsToAdd.Add(product);
				existingNames.Add(productName);
				if (isbn is not null)
				{
					existingIsbns.Add(isbn);
				}
			}

			if (productsToAdd.Count > 0)
			{
				context.Products.AddRange(productsToAdd);
			}

			await context.SaveChangesAsync();
			result.ProductsAdded = productsToAdd.Count;
			result.Success = true;
			result.Message =
				$"Готово. Додано книг: {result.ProductsAdded}, оновлено обкладинок: {result.ProductsImagesUpdated}, " +
				$"без змін (вже є): {result.ProductsSkipped}, " +
				$"авторів додано: {result.AuthorsAdded}, оновлено: {result.AuthorsUpdated}, " +
				$"видавнив: {result.PublishersAdded}, категорій: {result.CategoriesAdded}.";

			return result;
		}

		/// <summary>
		/// After renaming authors (e.g. EN→UA) the DB can contain multiple rows with the same name.
		/// Keep the oldest Id, move product links, delete the rest.
		/// </summary>
		private static async Task DeduplicateAuthorsByNameAsync(FamilyClubContext context)
		{
			var authors = await context.Authors
				.Include(a => a.Products)
				.ToListAsync();

			var duplicateGroups = authors
				.Where(a => !string.IsNullOrWhiteSpace(a.AuthorName))
				.GroupBy(a => a.AuthorName.Trim(), StringComparer.OrdinalIgnoreCase)
				.Where(g => g.Count() > 1)
				.ToList();

			if (duplicateGroups.Count == 0)
			{
				return;
			}

			foreach (var group in duplicateGroups)
			{
				var ordered = group.OrderBy(a => a.Id).ToList();
				var keep = ordered[0];
				foreach (var dupe in ordered.Skip(1))
				{
					foreach (var product in dupe.Products.ToList())
					{
						if (!keep.Products.Any(p => p.Id == product.Id))
						{
							keep.Products.Add(product);
						}

						dupe.Products.Remove(product);
					}

					if (string.IsNullOrWhiteSpace(keep.Biography) && !string.IsNullOrWhiteSpace(dupe.Biography))
					{
						keep.Biography = dupe.Biography;
					}

					if (string.IsNullOrWhiteSpace(keep.PhotoUrl) && !string.IsNullOrWhiteSpace(dupe.PhotoUrl))
					{
						keep.PhotoUrl = dupe.PhotoUrl;
					}

					context.Authors.Remove(dupe);
				}
			}

			await context.SaveChangesAsync();
		}

		private static async Task<bool> TryRefreshProductImagesAsync(
			Product product,
			List<string>? imageFiles,
			string imagesRoot)
		{
			if (imageFiles is null || imageFiles.Count == 0)
			{
				return false;
			}

			var loaded = new List<(string Name, byte[] Data)>();
			foreach (var relative in imageFiles.Take(5))
			{
				var fullPath = Path.Combine(imagesRoot, relative.Replace('/', Path.DirectorySeparatorChar));
				if (!File.Exists(fullPath))
				{
					continue;
				}

				var bytes = await File.ReadAllBytesAsync(fullPath);
				if (bytes.Length < 1500)
				{
					continue;
				}

				loaded.Add((Path.GetFileName(fullPath), bytes));
			}

			if (loaded.Count == 0)
			{
				return false;
			}

			var existing = product.ProductImages ?? new List<ProductImage>();
			var existingFingerprint = string.Join(
				"|",
				existing
					.OrderBy(i => i.ImageName)
					.Select(i => $"{i.ImageName}:{i.ImageData?.LongLength ?? 0}"));
			var newFingerprint = string.Join(
				"|",
				loaded
					.OrderBy(i => i.Name)
					.Select(i => $"{i.Name}:{i.Data.LongLength}"));

			if (string.Equals(existingFingerprint, newFingerprint, StringComparison.Ordinal))
			{
				return false;
			}

			existing.Clear();
			foreach (var (name, data) in loaded)
			{
				existing.Add(new ProductImage
				{
					ImageName = name,
					ImageData = data
				});
			}

			product.ProductImages = existing;
			return true;
		}

		private static async Task NormalizeUkrainianTaxonomyAsync(FamilyClubContext context)
		{
			var categoryMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
			{
				["Fiction"] = "Художня література",
				["Fantasy"] = "Фентезі",
				["Thriller"] = "Трилер",
				["Romance"] = "Романтика",
				["Mystery"] = "Детектив",
				["Nonfiction"] = "Нон-фікшн",
				["Science Fiction"] = "Наукова фантастика",
				["Horror"] = "Жахи",
			};

			var categories = await context.Categories.ToListAsync();
			foreach (var category in categories)
			{
				if (categoryMap.TryGetValue(category.CategoryName, out var uaName)
					&& !string.Equals(category.CategoryName, uaName, StringComparison.Ordinal))
				{
					var duplicate = categories.FirstOrDefault(c =>
						c.Id != category.Id
						&& string.Equals(c.CategoryName, uaName, StringComparison.OrdinalIgnoreCase));
					if (duplicate is null)
					{
						category.CategoryName = uaName;
					}
				}
			}

			var english = await context.Languages.FirstOrDefaultAsync(l => l.LanguageName == "English");
			var ukrainian = await context.Languages.FirstOrDefaultAsync(l => l.LanguageName == "Українська");
			if (english is not null)
			{
				if (ukrainian is null)
				{
					english.LanguageName = "Українська";
				}
			}

			await context.SaveChangesAsync();
		}

		private static string? ResolveProductImagesRoot(IConfiguration configuration)
		{
			var configured = configuration["Seed:ProductImagesPath"];
			if (!string.IsNullOrWhiteSpace(configured))
			{
				try
				{
					var fullConfigured = Path.GetFullPath(configured);
					if (Directory.Exists(fullConfigured) && File.Exists(Path.Combine(fullConfigured, "seed-catalog.json")))
					{
						return fullConfigured;
					}
				}
				catch
				{
					// fall through to probes
				}
			}

			var probe = new[]
			{
				Path.Combine(AppContext.BaseDirectory, "wwwroot", "images", "product_images"),
				Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "product_images"),
				Path.Combine(Directory.GetCurrentDirectory(), "..", "FamilyClub.React", "famiy.club.react", "public", "images", "product_images"),
				Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "FamilyClub.React", "famiy.club.react", "public", "images", "product_images"),
				Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "FamilyClub.React", "famiy.club.react", "public", "images", "product_images"),
				Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "FamilyClub.React", "famiy.club.react", "public", "images", "product_images"),
			};

			foreach (var path in probe)
			{
				try
				{
					var full = Path.GetFullPath(path);
					if (Directory.Exists(full) && File.Exists(Path.Combine(full, "seed-catalog.json")))
					{
						return full;
					}
				}
				catch
				{
					// ignore invalid paths
				}
			}

			return null;
		}

		private static async Task<Language> EnsureLanguageAsync(FamilyClubContext context, string name)
		{
			var existing = await context.Languages.FirstOrDefaultAsync(x => x.LanguageName == name);
			if (existing is not null)
			{
				return existing;
			}

			var entity = new Language { LanguageName = name };
			context.Languages.Add(entity);
			await context.SaveChangesAsync();
			return entity;
		}

		private static async Task<Format> EnsureFormatAsync(FamilyClubContext context, string name, string code)
		{
			var existing = await context.ProductFormats.FirstOrDefaultAsync(x => x.Code == code);
			if (existing is not null)
			{
				return existing;
			}

			var entity = new Format { Name = name, Code = code };
			context.ProductFormats.Add(entity);
			await context.SaveChangesAsync();
			return entity;
		}

		private static async Task<BookSize> EnsureBookSizeAsync(FamilyClubContext context, string name, string code)
		{
			var existing = await context.BookSizes.FirstOrDefaultAsync(x => x.Code == code);
			if (existing is not null)
			{
				return existing;
			}

			var entity = new BookSize { Name = name, Code = code };
			context.BookSizes.Add(entity);
			await context.SaveChangesAsync();
			return entity;
		}

		private static async Task<AgeRestriction> EnsureAgeRestrictionAsync(FamilyClubContext context, string name, string code)
		{
			var existing = await context.AgeRestrictions.FirstOrDefaultAsync(x => x.Code == code);
			if (existing is not null)
			{
				return existing;
			}

			var entity = new AgeRestriction { Name = name, Code = code };
			context.AgeRestrictions.Add(entity);
			await context.SaveChangesAsync();
			return entity;
		}

		private sealed class SeedCatalog
		{
			public List<SeedAuthor>? Authors { get; set; }
			public List<SeedBook>? Books { get; set; }
		}

		private sealed class SeedAuthor
		{
			public string AuthorName { get; set; } = "";
			public string? Biography { get; set; }
			public string? PhotoFile { get; set; }
		}

		private sealed class SeedBook
		{
			public string ProductName { get; set; } = "";
			public string? OriginalTitle { get; set; }
			public string? Description { get; set; }
			public List<string>? Authors { get; set; }
			public string? Publisher { get; set; }
			public List<string>? Categories { get; set; }
			public string? Isbn { get; set; }
			public int? PageCount { get; set; }
			public int? PublishingYear { get; set; }
			public List<string>? ImageFiles { get; set; }
			public decimal Price { get; set; }
		}
	}
}
