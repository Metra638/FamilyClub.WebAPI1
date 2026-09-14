using FamilyClub.BLL.DTOs.Category;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;

    private const string AllCategoriesCacheKey = "categories_all";
    private static string GetCategoryCacheKey(int id) => $"categories_item_{id}";
    private static readonly SemaphoreSlim _categoriesLock = new(1, 1);

    public CategoryService(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ICacheService cacheService)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cachedCategories = await _cacheService.GetAsync<List<CategoryDto>>(AllCategoriesCacheKey, cancellationToken);
        if (cachedCategories is not null)
        {
            return cachedCategories;
        }

        await _categoriesLock.WaitAsync(cancellationToken);
        try
        {
            cachedCategories = await _cacheService.GetAsync<List<CategoryDto>>(AllCategoriesCacheKey, CancellationToken.None);
            if (cachedCategories is not null)
            {
                return cachedCategories;
            }

            var categories = await _categoryRepository.GetAllAsync(CancellationToken.None);
            var dtos = categories.Select(MapToReadDto).ToList();

            await _cacheService.SetAsync(AllCategoriesCacheKey, dtos, TimeSpan.FromMinutes(30), CancellationToken.None);

            return dtos;
        }
        finally
        {
            _categoriesLock.Release();
        }
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCategoryCacheKey(id);
        var cachedCategory = await _cacheService.GetAsync<CategoryDto>(cacheKey, cancellationToken);
        if (cachedCategory is not null)
        {
            return cachedCategory;
        }

        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return null;
        }

        var dto = MapToReadDto(category);
        await _cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(30), cancellationToken);

        return dto;
    }

    public async Task<CategoryDto> CreateAsync(CategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            CategoryName = dto.CategoryName.Trim()
        };

        await _categoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken);

        return MapToReadDto(category);
    }

    public async Task<bool> UpdateAsync(int id, CategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return false;
        }

        category.CategoryName = dto.CategoryName.Trim();
        _categoryRepository.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return false;
        }

        _categoryRepository.Delete(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
    {
        await _cacheService.RemoveAsync(AllCategoriesCacheKey, cancellationToken);
        if (id.HasValue)
        {
            await _cacheService.RemoveAsync(GetCategoryCacheKey(id.Value), cancellationToken);
        }
        await _cacheService.RemoveByPrefixAsync("categories_", cancellationToken);
        await _cacheService.RemoveAsync("products_all_v2", cancellationToken);
    }

    private static CategoryDto MapToReadDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            CategoryName = category.CategoryName
        };
    }
}

