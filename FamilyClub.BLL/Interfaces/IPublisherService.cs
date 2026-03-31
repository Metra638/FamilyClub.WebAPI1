using FamilyClub.BLL.DTOs.Publisher;

namespace FamilyClub.BLL.Interfaces;

public interface IPublisherService
{
    Task<IEnumerable<PublisherDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PublisherDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PublisherDto> CreateAsync(PublisherDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, PublisherDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
