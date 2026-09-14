using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class PublisherService : IPublisherService
{
    private readonly IPublisherRepository _publisherRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;

    private const string AllPublishersCacheKey = "publishers_all";
    private static string GetPublisherCacheKey(int id) => $"publishers_item_{id}";

    public PublisherService(
        IPublisherRepository publisherRepository,
        IUnitOfWork unitOfWork,
        ICacheService cacheService)
    {
        _publisherRepository = publisherRepository;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
    }

    public async Task<IEnumerable<PublisherDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cached = await _cacheService.GetAsync<List<PublisherDto>>(AllPublishersCacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var publishers = await _publisherRepository.GetAllAsync(cancellationToken);
        var dtos = publishers.Select(MapToReadDto).ToList();
        await _cacheService.SetAsync(AllPublishersCacheKey, dtos, TimeSpan.FromMinutes(30), cancellationToken);
        return dtos;
    }

    public async Task<PublisherDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var key = GetPublisherCacheKey(id);
        var cached = await _cacheService.GetAsync<PublisherDto>(key, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var publisher = await _publisherRepository.GetByIdAsync(id, cancellationToken);
        if (publisher is null)
        {
            return null;
        }

        var dto = MapToReadDto(publisher);
        await _cacheService.SetAsync(key, dto, TimeSpan.FromMinutes(30), cancellationToken);
        return dto;
    }

    public async Task<PublisherDto> CreateAsync(PublisherDto dto, CancellationToken cancellationToken = default)
    {
        var publisher = new Publisher
        {
            PublisherName = dto.PublisherName.Trim()
        };

        await _publisherRepository.AddAsync(publisher, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, publisher.Id);

        return MapToReadDto(publisher);
    }

    public async Task<bool> UpdateAsync(int id, PublisherDto dto, CancellationToken cancellationToken = default)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id, cancellationToken);
        if (publisher is null)
        {
            return false;
        }

        publisher.PublisherName = dto.PublisherName.Trim();
        _publisherRepository.Update(publisher);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id, cancellationToken);
        if (publisher is null)
        {
            return false;
        }

        _publisherRepository.Delete(publisher);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
    {
        await _cacheService.RemoveAsync(AllPublishersCacheKey, cancellationToken);
        if (id.HasValue)
        {
            await _cacheService.RemoveAsync(GetPublisherCacheKey(id.Value), cancellationToken);
        }
        await _cacheService.RemoveByPrefixAsync("publishers_", cancellationToken);
    }

    private static PublisherDto MapToReadDto(Publisher publisher)
    {
        return new PublisherDto
        {
            Id = publisher.Id,
            PublisherName = publisher.PublisherName
        };
    }
}
