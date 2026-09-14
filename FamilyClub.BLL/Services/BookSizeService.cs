using FamilyClub.BLL.DTOs.BookSize;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
	public class BookSizeService: IBookSizeService
	{
		private readonly IBookSizeRepository _bookSizeRepository;
		private readonly IUnitOfWork _unitOfWork;
		private readonly ICacheService _cacheService;

		private const string AllBookSizesCacheKey = "booksizes_all";
		private static string GetBookSizeCacheKey(int id) => $"booksizes_item_{id}";

		public BookSizeService(
			IBookSizeRepository bookSizeRepository,
			IUnitOfWork unitOfWork,
			ICacheService cacheService)
		{
			_bookSizeRepository = bookSizeRepository;
			_unitOfWork = unitOfWork;
			_cacheService = cacheService;
		}

		public async Task<IEnumerable<BookSizeDto>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var cached = await _cacheService.GetAsync<List<BookSizeDto>>(AllBookSizesCacheKey, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var bookSizes = await _bookSizeRepository.GetAllAsync(cancellationToken);
			var dtos = bookSizes.Select(MapToReadDto).ToList();
			await _cacheService.SetAsync(AllBookSizesCacheKey, dtos, TimeSpan.FromHours(1), cancellationToken);
			return dtos;
		}

		public async Task<BookSizeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var key = GetBookSizeCacheKey(id);
			var cached = await _cacheService.GetAsync<BookSizeDto>(key, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var bookSize = await _bookSizeRepository.GetByIdAsync(id, cancellationToken);
			if (bookSize is null)
			{
				return null;
			}

			var dto = MapToReadDto(bookSize);
			await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
			return dto;
		}

		public async Task<BookSizeDto> CreateAsync(BookSizeDto dto, CancellationToken cancellationToken = default)
		{
			var bookSize = new BookSize
			{
				Name = dto.Name.Trim(),
				Code = dto.Code?.Trim(),
			};

			await _bookSizeRepository.AddAsync(bookSize, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, bookSize.Id);

			return MapToReadDto(bookSize);
		}

		public async Task<bool> UpdateAsync(int id, BookSizeDto dto, CancellationToken cancellationToken = default)
		{
			var bookSize = await _bookSizeRepository.GetByIdAsync(id, cancellationToken);
			if (bookSize is null)
			{
				return false;
			}

			bookSize.Name = dto.Name.Trim();
			bookSize.Code = dto.Code?.Trim();

			_bookSizeRepository.Update(bookSize);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var bookSize = await _bookSizeRepository.GetByIdAsync(id, cancellationToken);
			if (bookSize is null)
			{
				return false;
			}

			_bookSizeRepository.Delete(bookSize);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
		{
			await _cacheService.RemoveAsync(AllBookSizesCacheKey, cancellationToken);
			if (id.HasValue)
			{
				await _cacheService.RemoveAsync(GetBookSizeCacheKey(id.Value), cancellationToken);
			}
			await _cacheService.RemoveByPrefixAsync("booksizes_", cancellationToken);
		}

		private static BookSizeDto MapToReadDto(BookSize bookSize)
		{
			return new BookSizeDto
			{
				Id = bookSize.Id,
				Name = bookSize.Name,
				Code = bookSize.Code,
			};
		}
	}
}
