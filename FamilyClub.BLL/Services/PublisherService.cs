using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class PublisherService : IPublisherService
{
    private readonly IPublisherRepository _publisherRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PublisherService(IPublisherRepository publisherRepository, IUnitOfWork unitOfWork)
    {
        _publisherRepository = publisherRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PublisherDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var publishers = await _publisherRepository.GetAllAsync(cancellationToken);
        return publishers.Select(MapToReadDto);
    }

    public async Task<PublisherDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var publisher = await _publisherRepository.GetByIdAsync(id, cancellationToken);
        return publisher is null ? null : MapToReadDto(publisher);
    }

    public async Task<PublisherDto> CreateAsync(PublisherDto dto, CancellationToken cancellationToken = default)
    {
        var publisher = new Publisher
        {
            PublisherName = dto.PublisherName.Trim()
        };

        await _publisherRepository.AddAsync(publisher, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

        return true;
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
