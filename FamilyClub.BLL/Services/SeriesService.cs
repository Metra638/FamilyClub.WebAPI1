using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.DTOs.Series;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class SeriesService : ISeriesService
{
    private readonly ISeriesRepository _seriesRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SeriesService(ISeriesRepository seriesRepository, IUnitOfWork unitOfWork)
    {
        _seriesRepository = seriesRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SeriesDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var series = await _seriesRepository.GetAllAsync(cancellationToken);
        return series.Select(MapToReadDto);
    }

    public async Task<SeriesDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var serie = await _seriesRepository.GetByIdAsync(id, cancellationToken);
        return serie is null ? null : MapToReadDto(serie);
    }

    public async Task<SeriesDto> CreateAsync(SeriesDto dto, CancellationToken cancellationToken = default)
    {
        var serie = new Series
        {
            SerieTitle = dto.SerieTitle.Trim()
        };

        await _seriesRepository.AddAsync(serie, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

        return true;
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
