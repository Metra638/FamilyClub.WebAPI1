using FamilyClub.BLL.DTOs.Series;

namespace FamilyClub.BLL.Interfaces;

public interface ISeriesService
{
    Task<IEnumerable<SeriesDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SeriesDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SeriesDto> CreateAsync(SeriesDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, SeriesDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
