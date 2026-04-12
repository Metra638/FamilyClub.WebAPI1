using FamilyClub.BLL.DTOs.Product;
using Microsoft.AspNetCore.Http;

namespace FamilyClub.BLL.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(ProductDto dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, ProductDto dto, List<IFormFile> productImageFiles, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}