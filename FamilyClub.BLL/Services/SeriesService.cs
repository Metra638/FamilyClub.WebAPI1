using FamilyClub.BLL.DTOs.Series;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class SeriesService : ISeriesService
{
    private readonly ISeriesRepository _seriesRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;

    private const string AllSeriesCacheKey = "series_all";
    private static string GetSeriesCacheKey(int id) => $"series_item_{id}";

    public SeriesService(
        ISeriesRepository seriesRepository,
        IUnitOfWork unitOfWork,
        ICacheService cacheService)
    {
        _seriesRepository = seriesRepository;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
    }

    public async Task<IEnumerable<SeriesDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var cached = await _cacheService.GetAsync<List<SeriesDto>>(AllSeriesCacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var series = await _seriesRepository.GetAllAsync(cancellationToken);
        var dtos = series.Select(MapToReadDto).ToList();
        await _cacheService.SetAsync(AllSeriesCacheKey, dtos, TimeSpan.FromHours(1), cancellationToken);
        return dtos;
    }

    public async Task<SeriesDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var key = GetSeriesCacheKey(id);
        var cached = await _cacheService.GetAsync<SeriesDto>(key, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var serie = await _seriesRepository.GetByIdAsync(id, cancellationToken);
        if (serie is null)
        {
            return null;
        }

        var dto = MapToReadDto(serie);
        await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
        return dto;
    }

    public async Task<SeriesDto> CreateAsync(SeriesDto dto, CancellationToken cancellationToken = default)
    {
        var serie = new Series
        {
            SerieTitle = dto.SerieTitle.Trim()
        };

        await _seriesRepository.AddAsync(serie, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, serie.Id);

        return MapToReadDto(serie);
    }

    public async Task<bool> UpdateAsync(int id, SeriesDto dto, CancellationToken cancellationToken = default)
    {
        var serie = await _seriesRepository.GetByIdAsync(id, cancellationToken);
        if (serie is null)
        {
            return false;
        }

        serie.SerieTitle = dto.SerieTitle.Trim();
        _seriesRepository.Update(serie);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var serie = await _seriesRepository.GetByIdAsync(id, cancellationToken);
        if (serie is null)
        {
            return false;
        }

        _seriesRepository.Delete(serie);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateCacheAsync(cancellationToken, id);

        return true;
    }

    private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
    {
        await _cacheService.RemoveAsync(AllSeriesCacheKey, cancellationToken);
        if (id.HasValue)
        {
            await _cacheService.RemoveAsync(GetSeriesCacheKey(id.Value), cancellationToken);
        }
        await _cacheService.RemoveByPrefixAsync("series_", cancellationToken);
    }

    private static SeriesDto MapToReadDto(Series serie)
    {
        return new SeriesDto
        {
            Id = serie.Id,
            SerieTitle = serie.SerieTitle
        };
    }
}
