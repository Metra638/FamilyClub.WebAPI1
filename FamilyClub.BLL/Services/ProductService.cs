using FamilyClub.BLL.DTOs.Product;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Http;

namespace FamilyClub.BLL.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.GetAllAsync(cancellationToken);
        foreach (var product in products)
        {
            product.ProductImages = (await _productRepository
                .GetProductImagesByProductIdAsync(product.Id, cancellationToken))
                .ToList();
        }
        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return null;
        }

        product.ProductImages = (await _productRepository
            .GetProductImagesByProductIdAsync(id, cancellationToken))
            .ToList();

        return MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(ProductDto? dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default)
    {
        dto.ProductImages ??= new List<ProductImage>();
        dto = await UploadImagesAsync(dto, productImageFiles);

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
            Format = dto.Format,
            OriginalLanguageId = dto.OriginalLanguageId,
            ISBN = dto.ISBN,
            PromotionId = dto.PromotionId,
            ProductCode = dto.ProductCode,
            WeightGrams = dto.WeightGrams,
            ItemsInSet = dto.ItemsInSet,
            AgeRestrictions = dto.AgeRestrictions,
            ProductImages = dto.ProductImages?.Select(productImage => new ProductImage
            {
                ImageData = productImage.ImageData,
                ImageName = productImage.ImageName
            }).ToList()
        };

        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(product);
    }

    public async Task<bool> UpdateAsync(int id, ProductDto dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default)
    {
        var existingProduct = await _productRepository.GetByIdWithImagesAsync(id, cancellationToken);
        if (existingProduct is null)
        {
            return false;
        }

        existingProduct.ProductName = dto.ProductName.Trim();
        existingProduct.Price = dto.Price;
        existingProduct.DiscountPrice = dto.DiscountPrice;
        existingProduct.Description = dto.Description;
        existingProduct.PublisherId = dto.PublisherId;
        existingProduct.OriginalTitle = dto.OriginalTitle;
        existingProduct.PageCount = dto.PageCount;
        existingProduct.PublishingDate = dto.PublishingDate;
        existingProduct.Format = dto.Format;
        existingProduct.OriginalLanguageId = dto.OriginalLanguageId;
        existingProduct.ISBN = dto.ISBN;
        existingProduct.PromotionId = dto.PromotionId;
        existingProduct.ProductCode = dto.ProductCode;
        existingProduct.WeightGrams = dto.WeightGrams;
        existingProduct.ItemsInSet = dto.ItemsInSet;
        existingProduct.AgeRestrictions = dto.AgeRestrictions;

        if (!dto.LeaveOldImages)
        {
            existingProduct.ProductImages?.Clear();
        }

        if (productImageFiles is { Count: > 0 })
        {
            dto.ProductImages = new List<ProductImage>();
            await UploadImagesAsync(dto, productImageFiles);

            foreach (var image in dto.ProductImages)
            {
                existingProduct.ProductImages?.Add(new ProductImage
                {
                    ImageData = image.ImageData,
                    ImageName = image.ImageName,
                    ProductId = existingProduct.Id
                });
            }
        }

        _productRepository.Update(existingProduct);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return false;
        }

        _productRepository.Delete(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<ProductDto?> UploadImagesAsync(ProductDto? productDto, List<IFormFile> imageFiles)
    {
        if (imageFiles != null && imageFiles.Count > 0)
        {
            int maxImageNumber = Math.Min(imageFiles.Count, 5);

            for (int i = 0; i < maxImageNumber; i++)
            {
                var file = imageFiles[i];
                if (file.Length > 0)
                {
                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream);
                    byte[] imageData = memoryStream.ToArray();
                    var productImage = new ProductImage
                    {
                        ImageData = imageData,
                        ImageName = file.FileName,
                    };
                    productDto?.ProductImages?.Add(productImage);
                }
            }
        }
        return productDto;
    }

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
            Format = product.Format,
            OriginalLanguageId = product.OriginalLanguageId,
            ISBN = product.ISBN,
            PromotionId = product.PromotionId,
            ProductCode = product.ProductCode,
            WeightGrams = product.WeightGrams,
            ItemsInSet = product.ItemsInSet,
            AgeRestrictions = product.AgeRestrictions,
            ProductImages = product.ProductImages?.Select(productImage => new ProductImage
            {
                ImageData = productImage.ImageData,
                ImageName = productImage.ImageName
            }).ToList()
        };
    }
}