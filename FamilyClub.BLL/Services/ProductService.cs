using FamilyClub.BLL.DTOs.ActionLog;
using FamilyClub.BLL.DTOs.Product;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FamilyClub.BLL.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
	private readonly FamilyClubContext _context;
	private readonly IActionLogService _actionLog;
	private readonly ICacheService _cacheService;
	private readonly IStorageService _storageService;

	// Bump when list DTO shape changes (e.g. cover stubs without ImageData) so Redis/L1 stale payloads are skipped.
	private const string AllProductsCacheKey = "products_all_v5";
	private static string GetProductCacheKey(int id) => $"products_item_v5_{id}";
	private static readonly SemaphoreSlim _productsLock = new(1, 1);

	public ProductService(
		IProductRepository productRepository,
		IUnitOfWork unitOfWork,
		FamilyClubContext context,
		IActionLogService actionLog,
		ICacheService cacheService,
		IStorageService storageService)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
		_context = context;
		_actionLog = actionLog;
		_cacheService = cacheService;
		_storageService = storageService;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cachedProducts = await _cacheService.GetAsync<List<ProductDto>>(AllProductsCacheKey, cancellationToken);
        if (cachedProducts is not null)
        {
            return cachedProducts;
        }

        await _productsLock.WaitAsync(cancellationToken);
        try
        {
            cachedProducts = await _cacheService.GetAsync<List<ProductDto>>(AllProductsCacheKey, CancellationToken.None);
            if (cachedProducts is not null)
            {
                return cachedProducts;
            }

            // List payload: cover id stub only (bytes served via GET .../images/{imageId}).
            var rows = await _context.Products
                .AsNoTracking()
                .Select(p => new
                {
                    p.Id,
                    p.ProductName,
                    p.Price,
                    p.DiscountPrice,
                    p.Description,
                    p.PublisherId,
                    p.OriginalTitle,
                    p.PageCount,
                    p.PublishingDate,
                    p.CoverType,
                    p.Availability,
                    p.QuantityInStock,
                    p.ProductCode,
                    p.WeightGrams,
                    p.ItemsInSet,
                    p.OriginalLanguageId,
                    p.ISBN,
                    p.PromotionId,
                    CoverImage = p.ProductImages
                        .OrderBy(i => i.Id)
                        .Select(i => new { i.Id, i.ImageName, i.ImageUrl })
                        .FirstOrDefault(),
                    AuthorIds = p.Authors.Select(a => a.Id).ToList(),
                    LanguageIds = p.Languages.Select(l => l.Id).ToList(),
                    CategoryIds = p.Categories.Select(c => c.Id).ToList(),
                    SeriesIds = p.Series.Select(s => s.Id).ToList(),
                    TranslatorIds = p.Translators.Select(t => t.Id).ToList(),
                    FormatIds = p.Formats.Select(f => f.Id).ToList(),
                    BookSizeIds = p.BookSizes.Select(f => f.Id).ToList(),
                    AgeRestrictionIds = p.AgeRestrictions.Select(a => a.Id).ToList(),
                })
                .ToListAsync(CancellationToken.None);

            var dtos = rows.Select(p => new ProductDto
            {
                Id = p.Id,
                ProductName = p.ProductName,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                Description = p.Description,
                PublisherId = p.PublisherId,
                OriginalTitle = p.OriginalTitle,
                PageCount = p.PageCount,
                PublishingDate = p.PublishingDate,
                CoverType = p.CoverType,
                Availability = p.Availability,
                QuantityInStock = p.QuantityInStock,
                ProductCode = p.ProductCode,
                WeightGrams = p.WeightGrams,
                ItemsInSet = p.ItemsInSet,
                OriginalLanguageId = p.OriginalLanguageId,
                ISBN = p.ISBN,
                PromotionId = p.PromotionId,
                ProductImages = p.CoverImage is null
                    ? new List<ProductImage>()
                    : new List<ProductImage>
                    {
                        new()
                        {
                            Id = p.CoverImage.Id,
                            ImageName = p.CoverImage.ImageName ?? string.Empty,
                            ImageData = Array.Empty<byte>(),
                            ImageUrl = p.CoverImage.ImageUrl,
                            ProductId = p.Id,
                        },
                    },
                AuthorIds = p.AuthorIds,
                LanguageIds = p.LanguageIds,
                CategoryIds = p.CategoryIds,
                SeriesIds = p.SeriesIds,
                TranslatorIds = p.TranslatorIds,
                FormatIds = p.FormatIds,
                BookSizeIds = p.BookSizeIds,
                AgeRestrictionIds = p.AgeRestrictionIds,
            }).ToList();

            await _cacheService.SetAsync(AllProductsCacheKey, dtos, TimeSpan.FromMinutes(30), CancellationToken.None);

            return dtos;
        }
        finally
        {
            _productsLock.Release();
        }
    }

    public async Task<string?> GetProductImageUrlAsync(
        int productId,
        int imageId,
        CancellationToken cancellationToken = default)
    {
        var image = await _context.Set<ProductImage>()
            .AsNoTracking()
            .Where(i => i.ProductId == productId && i.Id == imageId)
            .Select(i => new { i.ImageUrl })
            .FirstOrDefaultAsync(cancellationToken);

        return image?.ImageUrl;
    }

    public async Task<(byte[] Data, string ContentType)?> GetProductImageAsync(
        int productId,
        int imageId,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"product_img_{productId}_{imageId}";
        var cached = await _cacheService.GetAsync<CachedProductImage>(cacheKey, cancellationToken);
        if (cached is not null && cached.Data is not null && cached.Data.Length > 0)
        {
            return (cached.Data, cached.ContentType);
        }

        var image = await _context.Set<ProductImage>()
            .AsNoTracking()
            .Where(i => i.ProductId == productId && i.Id == imageId)
            .Select(i => new { i.ImageData, i.ImageName, i.ImageUrl, i.StorageKey })
            .FirstOrDefaultAsync(cancellationToken);

        if (image is null)
        {
            return null;
        }

        if (image.ImageData != null && image.ImageData.Length > 0)
        {
            var contentType = ResolveImageContentType(image.ImageName, image.ImageData);
            await _cacheService.SetAsync(
                cacheKey,
                new CachedProductImage { Data = image.ImageData, ContentType = contentType },
                TimeSpan.FromDays(7),
                cancellationToken);

            return (image.ImageData, contentType);
        }

        if (!string.IsNullOrEmpty(image.StorageKey) || !string.IsNullOrEmpty(image.ImageUrl))
        {
            var keyOrUrl = !string.IsNullOrEmpty(image.StorageKey) ? image.StorageKey : image.ImageUrl!;
            var downloaded = await _storageService.DownloadAsync(keyOrUrl, cancellationToken);
            if (downloaded.HasValue)
            {
                using var ms = new MemoryStream();
                await downloaded.Value.Stream.CopyToAsync(ms, cancellationToken);
                var data = ms.ToArray();
                var contentType = downloaded.Value.ContentType ?? ResolveImageContentType(image.ImageName, data);

                await _cacheService.SetAsync(
                    cacheKey,
                    new CachedProductImage { Data = data, ContentType = contentType },
                    TimeSpan.FromDays(7),
                    cancellationToken);

                return (data, contentType);
            }
        }

        return null;
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetProductCacheKey(id);
        var cachedProduct = await _cacheService.GetAsync<ProductDto>(cacheKey, cancellationToken);
        if (cachedProduct is not null)
        {
            return cachedProduct;
        }

        var product = await _context.Products
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Include(p => p.Authors)
            .Include(p => p.Languages)
            .Include(p => p.Categories)
            .Include(p => p.Series)
            .Include(p => p.Translators)
            .Include(p => p.Formats)
            .Include(p => p.BookSizes)
            .Include(p => p.AgeRestrictions)
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            return null;
        }

        // Load images for this single product
        var images = await _context.Set<ProductImage>()
            .AsNoTracking()
            .Where(i => i.ProductId == id)
            .OrderBy(i => i.Id)
            .Select(i => new ProductImage
            {
                Id = i.Id,
                ImageName = i.ImageName,
                ProductId = i.ProductId,
                ImageUrl = i.ImageUrl,
                StorageKey = i.StorageKey,
                ImageData = i.ImageData ?? Array.Empty<byte>()
            })
            .ToListAsync(cancellationToken);

        product.ProductImages = images;
        var dto = MapToDto(product);

        await _cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(30), cancellationToken);

        return dto;
    }

	//public async Task<ProductDto> CreateAsync(ProductDto? dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default)
	//{
	//    dto.ProductImages ??= new List<ProductImage>();
	//    dto = await UploadImagesAsync(dto, productImageFiles);

	//    var product = new Product
	//    {
	//        ProductName = dto.ProductName.Trim(),
	//        Price = dto.Price,
	//        DiscountPrice = dto.DiscountPrice,
	//        Description = dto.Description,
	//        PublisherId = dto.PublisherId,
	//        OriginalTitle = dto.OriginalTitle,
	//        PageCount = dto.PageCount,
	//        PublishingDate = dto.PublishingDate,
	//        Format = dto.Format,
	//        OriginalLanguageId = dto.OriginalLanguageId,
	//        ISBN = dto.ISBN,
	//        PromotionId = dto.PromotionId,
	//        ProductCode = dto.ProductCode,
	//        WeightGrams = dto.WeightGrams,
	//        ItemsInSet = dto.ItemsInSet,
	//        AgeRestrictions = dto.AgeRestrictions,
	//        ProductImages = dto.ProductImages?.Select(productImage => new ProductImage
	//        {
	//            ImageData = productImage.ImageData,
	//            ImageName = productImage.ImageName
	//        }).ToList()
	//    };

	//    await _productRepository.AddAsync(product, cancellationToken);
	//    await _unitOfWork.SaveChangesAsync(cancellationToken);

	//    return MapToDto(product);
	//}
	public async Task<ProductDto> CreateAsync(
	ProductDto dto,
	List<IFormFile> productImageFiles,
	CancellationToken cancellationToken = default)
	{
		dto.ProductImages ??= new List<ProductImage>();

		dto = await UploadImagesAsync(dto, productImageFiles, cancellationToken);

		var product = new Product
		{
			ProductName = dto.ProductName.Trim(),
			Price = dto.Price,
			DiscountPrice = dto.DiscountPrice,
			Description = dto.Description,

			PublisherId = dto.PublisherId,

			OriginalTitle = dto.OriginalTitle,
			PageCount = dto.PageCount,
			PublishingDate = dto.PublishingDate,

			CoverType = dto.CoverType,
			Availability = dto.Availability,

			QuantityInStock = dto.QuantityInStock,
			ProductCode = dto.ProductCode,
			WeightGrams = dto.WeightGrams,
			ItemsInSet = dto.ItemsInSet,


			OriginalLanguageId = dto.OriginalLanguageId,
			ISBN = dto.ISBN,

			PromotionId = dto.PromotionId,

			ProductImages = dto.ProductImages?.Select(productImage => new ProductImage
			{
				ImageData = productImage.ImageData,
				ImageName = productImage.ImageName,
				ImageUrl = productImage.ImageUrl,
				StorageKey = productImage.StorageKey
			}).ToList()
		};

		// many-to-many
		product.Authors = dto.AuthorIds?.Count > 0
	? await _context.Authors.Where(a => dto.AuthorIds.Contains(a.Id)).ToListAsync(cancellationToken)
	: new();

		product.Languages = dto.LanguageIds?.Count > 0
			? await _context.Languages.Where(x => dto.LanguageIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		product.Categories = dto.CategoryIds?.Count > 0
			? await _context.Categories.Where(x => dto.CategoryIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		product.Series = dto.SeriesIds?.Count > 0
			? await _context.Series.Where(x => dto.SeriesIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		product.Translators = dto.TranslatorIds?.Count > 0
			? await _context.Translator.Where(x => dto.TranslatorIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		product.Formats = dto.FormatIds?.Count > 0
			? await _context.ProductFormats.Where(x => dto.FormatIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		product.BookSizes = dto.BookSizeIds?.Count > 0
			? await _context.BookSizes.Where(x => dto.BookSizeIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();


		product.AgeRestrictions = dto.AgeRestrictionIds?.Count > 0
			? await _context.AgeRestrictions.Where(x => dto.AgeRestrictionIds.Contains(x.Id)).ToListAsync(cancellationToken)
			: new();

		await _productRepository.AddAsync(product, cancellationToken);
		await _unitOfWork.SaveChangesAsync(cancellationToken);

		await InvalidateCacheAsync(cancellationToken);

		await SafeLogAsync(
			ActionLogCodes.Actions.Created,
			ActionLogCodes.Modules.Books,
			$"Створено книгу «{product.ProductName}», Id={product.Id}",
			ActionLogCodes.Levels.Success,
			cancellationToken);

		return MapToDto(product);
	}

	public async Task<bool> UpdateAsync(
	int id,
	ProductDto dto,
	List<IFormFile> productImageFiles,
	CancellationToken cancellationToken = default)
	{
		var existingProduct = await _productRepository.GetByIdAsync(id, cancellationToken);

		if (existingProduct is null)
			return false;

		// basic fields
		existingProduct.ProductName = dto.ProductName.Trim();
		existingProduct.Price = dto.Price;
		existingProduct.DiscountPrice = dto.DiscountPrice;
		existingProduct.Description = dto.Description;

		existingProduct.PublisherId = dto.PublisherId;

		existingProduct.OriginalTitle = dto.OriginalTitle;
		existingProduct.PageCount = dto.PageCount;
		existingProduct.PublishingDate = dto.PublishingDate;

		// enums
		existingProduct.CoverType = dto.CoverType;
		existingProduct.Availability = dto.Availability;

		// inventory / meta
		existingProduct.QuantityInStock = dto.QuantityInStock;
		existingProduct.ProductCode = dto.ProductCode;
		existingProduct.WeightGrams = dto.WeightGrams;
		existingProduct.ItemsInSet = dto.ItemsInSet;

		existingProduct.OriginalLanguageId = dto.OriginalLanguageId;
		existingProduct.ISBN = dto.ISBN;

		existingProduct.PromotionId = dto.PromotionId;

		// many-to-many 
		existingProduct.Authors = dto.AuthorIds?.Count > 0 ? await _context.Authors.Where(a => dto.AuthorIds.Contains(a.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.Languages = dto.LanguageIds?.Count > 0 ? await _context.Languages.Where(x => dto.LanguageIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.Categories = dto.CategoryIds?.Count > 0 ? await _context.Categories.Where(x => dto.CategoryIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.Series = dto.SeriesIds?.Count > 0 ? await _context.Series.Where(x => dto.SeriesIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.Translators = dto.TranslatorIds?.Count > 0 ? await _context.Translator.Where(x => dto.TranslatorIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.Formats = dto.FormatIds?.Count > 0 ? await _context.ProductFormats.Where(x => dto.FormatIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.BookSizes = dto.BookSizeIds?.Count > 0 ? await _context.BookSizes.Where(x => dto.BookSizeIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();
		existingProduct.AgeRestrictions = dto.AgeRestrictionIds?.Count > 0 ? await _context.AgeRestrictions.Where(x => dto.AgeRestrictionIds.Contains(x.Id)).ToListAsync(cancellationToken) : new();

		// IMAGES 
		if (!dto.LeaveOldImages)
		{
			existingProduct.ProductImages?.Clear();
		}

		if (!dto.LeaveOldImages && existingProduct.ProductImages != null)
		{
			foreach (var oldImg in existingProduct.ProductImages)
			{
				var key = oldImg.StorageKey ?? oldImg.ImageUrl;
				if (!string.IsNullOrWhiteSpace(key))
				{
					await _storageService.DeleteAsync(key, cancellationToken);
				}
			}
		}

		if (productImageFiles is { Count: > 0 })
		{
			dto.ProductImages = new List<ProductImage>();
			await UploadImagesAsync(dto, productImageFiles, cancellationToken);

			foreach (var image in dto.ProductImages)
			{
				existingProduct.ProductImages?.Add(new ProductImage
				{
					ImageData = image.ImageData,
					ImageName = image.ImageName,
					ImageUrl = image.ImageUrl,
					StorageKey = image.StorageKey,
					ProductId = existingProduct.Id
				});
			}
		}

		_productRepository.Update(existingProduct);
		await _unitOfWork.SaveChangesAsync(cancellationToken);

		await InvalidateCacheAsync(cancellationToken, id);

		return true;
	}

	//public async Task<bool> UpdateAsync(int id, ProductDto dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default)
	//   {
	//       var existingProduct = await _productRepository.GetByIdWithImagesAsync(id, cancellationToken);
	//       if (existingProduct is null)
	//       {
	//           return false;
	//       }

	//       existingProduct.ProductName = dto.ProductName.Trim();
	//       existingProduct.Price = dto.Price;
	//       existingProduct.DiscountPrice = dto.DiscountPrice;
	//       existingProduct.Description = dto.Description;
	//       existingProduct.PublisherId = dto.PublisherId;
	//       existingProduct.OriginalTitle = dto.OriginalTitle;
	//       existingProduct.PageCount = dto.PageCount;
	//       existingProduct.PublishingDate = dto.PublishingDate;
	//       existingProduct.Format = dto.Format;
	//       existingProduct.OriginalLanguageId = dto.OriginalLanguageId;
	//       existingProduct.ISBN = dto.ISBN;
	//       existingProduct.PromotionId = dto.PromotionId;
	//       existingProduct.ProductCode = dto.ProductCode;
	//       existingProduct.WeightGrams = dto.WeightGrams;
	//       existingProduct.ItemsInSet = dto.ItemsInSet;
	//       existingProduct.AgeRestrictions = dto.AgeRestrictions;

	//       if (!dto.LeaveOldImages)
	//       {
	//           existingProduct.ProductImages?.Clear();
	//       }

	//       if (productImageFiles is { Count: > 0 })
	//       {
	//           dto.ProductImages = new List<ProductImage>();
	//           await UploadImagesAsync(dto, productImageFiles);

	//           foreach (var image in dto.ProductImages)
	//           {
	//               existingProduct.ProductImages?.Add(new ProductImage
	//               {
	//                   ImageData = image.ImageData,
	//                   ImageName = image.ImageName,
	//                   ProductId = existingProduct.Id
	//               });
	//           }
	//       }

	//       _productRepository.Update(existingProduct);
	//       await _unitOfWork.SaveChangesAsync(cancellationToken);
	//       return true;
	//   }

	public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return false;
        }

		var title = product.ProductName;
        _productRepository.Delete(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

		await InvalidateCacheAsync(cancellationToken, id);

		await SafeLogAsync(
			ActionLogCodes.Actions.Deleted,
			ActionLogCodes.Modules.Books,
			$"Видалено книгу «{title}», Id={id}",
			ActionLogCodes.Levels.Warning,
			cancellationToken);

        return true;
    }

	private async Task SafeLogAsync(
		string action,
		string module,
		string details,
		string level,
		CancellationToken cancellationToken)
	{
		try
		{
			await _actionLog.LogAsync(action, module, details, level, cancellationToken: cancellationToken);
		}
		catch
		{
			// Журнал не повинен ламати основну операцію
		}
	}

    private async Task<ProductDto?> UploadImagesAsync(ProductDto? productDto, List<IFormFile> imageFiles, CancellationToken cancellationToken = default)
    {
        if (imageFiles != null && imageFiles.Count > 0)
        {
            int maxImageNumber = Math.Min(imageFiles.Count, 5);

            for (int i = 0; i < maxImageNumber; i++)
            {
                var file = imageFiles[i];
                if (file.Length > 0)
                {
                    string? imageUrl = null;
                    string? storageKey = null;
                    byte[]? imageData = null;

                    if (_storageService.IsConfigured)
                    {
                        try
                        {
                            imageUrl = await _storageService.UploadFileAsync(file, "products", cancellationToken);
                            storageKey = _storageService.ExtractKey(imageUrl);
                            imageData = Array.Empty<byte>();
                        }
                        catch (Exception ex)
                        {
                            await SafeLogAsync("UploadImageS3Fallback", "ProductService", $"S3 upload fallback for {file.FileName}: {ex.Message}", ActionLogCodes.Levels.Warning, cancellationToken);
                        }
                    }

                    if (string.IsNullOrEmpty(imageUrl))
                    {
                        using var memoryStream = new MemoryStream();
                        await file.CopyToAsync(memoryStream, cancellationToken);
                        imageData = memoryStream.ToArray();
                    }

                    var productImage = new ProductImage
                    {
                        ImageData = imageData ?? Array.Empty<byte>(),
                        ImageName = file.FileName,
                        ImageUrl = imageUrl,
                        StorageKey = storageKey
                    };
                    productDto?.ProductImages?.Add(productImage);
                }
            }
        }
        return productDto;
    }

	//private static ProductDto MapToDto(Product product)
	//{
	//    return new ProductDto
	//    {
	//        Id = product.Id,
	//        ProductName = product.ProductName,
	//        Price = product.Price,
	//        DiscountPrice = product.DiscountPrice,
	//        Description = product.Description,
	//        PublisherId = product.PublisherId,
	//        OriginalTitle = product.OriginalTitle,
	//        PageCount = product.PageCount,
	//        PublishingDate = product.PublishingDate,
	//        Format = product.Format,
	//        OriginalLanguageId = product.OriginalLanguageId,
	//        ISBN = product.ISBN,
	//        PromotionId = product.PromotionId,
	//        ProductCode = product.ProductCode,
	//        WeightGrams = product.WeightGrams,
	//        ItemsInSet = product.ItemsInSet,
	//        AgeRestrictions = product.AgeRestrictions,
	//        ProductImages = product.ProductImages?.Select(productImage => new ProductImage
	//        {
	//            ImageData = productImage.ImageData,
	//            ImageName = productImage.ImageName
	//        }).ToList()
	//    };
	//}

	private static ProductDto MapToDto(Product product)
	{
		return new ProductDto
		{
			Id = product.Id,

			ProductName = product.ProductName,
			Price = product.Price,
			DiscountPrice = product.DiscountPrice,
			Description = product.Description,

			PublisherId = product.PublisherId,

			OriginalTitle = product.OriginalTitle,
			PageCount = product.PageCount,
			PublishingDate = product.PublishingDate,

			CoverType = product.CoverType,
			Availability = product.Availability,

			QuantityInStock = product.QuantityInStock,
			ProductCode = product.ProductCode,
			WeightGrams = product.WeightGrams,
			ItemsInSet = product.ItemsInSet,

			OriginalLanguageId = product.OriginalLanguageId,
			ISBN = product.ISBN,

			PromotionId = product.PromotionId,

			// images 
			ProductImages = product.ProductImages?.Select(img => new ProductImage
			{
				Id = img.Id,
				ImageData = img.ImageData,
				ImageName = img.ImageName,
				ImageUrl = img.ImageUrl,
				StorageKey = img.StorageKey,
				ProductId = product.Id,
			}).ToList(),

			// many-to-many 
			AuthorIds = product.Authors?.Select(a => a.Id).ToList(),
			LanguageIds = product.Languages?.Select(l => l.Id).ToList(),
			CategoryIds = product.Categories?.Select(c => c.Id).ToList(),
			SeriesIds = product.Series?.Select(s => s.Id).ToList(),
			TranslatorIds = product.Translators?.Select(t => t.Id).ToList(),
			FormatIds = product.Formats?.Select(f => f.Id).ToList(),
			BookSizeIds = product.BookSizes?.Select(f => f.Id).ToList(),
			AgeRestrictionIds = product.AgeRestrictions?.Select(a => a.Id).ToList(),
		};
	}

	private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
	{
		await _cacheService.RemoveAsync(AllProductsCacheKey, cancellationToken);
		if (id.HasValue)
		{
			await _cacheService.RemoveAsync(GetProductCacheKey(id.Value), cancellationToken);
		}
		await _cacheService.RemoveByPrefixAsync("products_", cancellationToken);
	}

	private static string ResolveImageContentType(string imageName, byte[] imageData)
	{
		var extension = Path.GetExtension(imageName)?.TrimStart('.').ToLowerInvariant();
		switch (extension)
		{
			case "webp":
			 return "image/webp";
			case "png":
			 return "image/png";
			case "gif":
			 return "image/gif";
			case "jpg":
			case "jpeg":
			 return "image/jpeg";
		}

		if (imageData.Length >= 12 &&
		    imageData[0] == 0x52 && imageData[1] == 0x49 && imageData[2] == 0x46 && imageData[3] == 0x46)
		{
			return "image/webp";
		}

		if (imageData.Length >= 3 &&
		    imageData[0] == 0xFF && imageData[1] == 0xD8 && imageData[2] == 0xFF)
		{
			return "image/jpeg";
		}

		if (imageData.Length >= 8 &&
		    imageData[0] == 0x89 && imageData[1] == 0x50 && imageData[2] == 0x4E && imageData[3] == 0x47)
		{
			return "image/png";
		}

		return "image/jpeg";
	}
}

public class CachedProductImage
{
	public byte[] Data { get; set; } = Array.Empty<byte>();
	public string ContentType { get; set; } = "image/jpeg";
}
