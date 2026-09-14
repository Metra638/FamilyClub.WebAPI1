using FamilyClub.BLL.DTOs.Format;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
    public class FormatService : IFormatService
	{
		private readonly IFormatRepository _formatRepository;
		private readonly IUnitOfWork _unitOfWork;
		private readonly ICacheService _cacheService;

		private const string AllFormatsCacheKey = "formats_all";
		private static string GetFormatCacheKey(int id) => $"formats_item_{id}";
		private static readonly SemaphoreSlim _formatsLock = new(1, 1);

		public FormatService(
			IFormatRepository formatRepository,
			IUnitOfWork unitOfWork,
			ICacheService cacheService)
		{
			_formatRepository = formatRepository;
			_unitOfWork = unitOfWork;
			_cacheService = cacheService;
		}

		public async Task<IEnumerable<FormatDto>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var cached = await _cacheService.GetAsync<List<FormatDto>>(AllFormatsCacheKey, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			await _formatsLock.WaitAsync(cancellationToken);
			try
			{
				cached = await _cacheService.GetAsync<List<FormatDto>>(AllFormatsCacheKey, CancellationToken.None);
				if (cached is not null)
				{
					return cached;
				}

				var formats = await _formatRepository.GetAllAsync(CancellationToken.None);
				var dtos = formats.Select(MapToReadDto).ToList();
				await _cacheService.SetAsync(AllFormatsCacheKey, dtos, TimeSpan.FromHours(1), CancellationToken.None);
				return dtos;
			}
			finally
			{
				_formatsLock.Release();
			}
		}

		public async Task<FormatDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var key = GetFormatCacheKey(id);
			var cached = await _cacheService.GetAsync<FormatDto>(key, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var format = await _formatRepository.GetByIdAsync(id, cancellationToken);
			if (format is null)
			{
				return null;
			}

			var dto = MapToReadDto(format);
			await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
			return dto;
		}

		public async Task<FormatDto> CreateAsync(FormatDto dto, CancellationToken cancellationToken = default)
		{
			var format = new Format
			{
				Name = dto.Name.Trim(),
				Code = dto.Code?.Trim(),
			};

			await _formatRepository.AddAsync(format, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, format.Id);

			return MapToReadDto(format);
		}

		public async Task<bool> UpdateAsync(int id, FormatDto dto, CancellationToken cancellationToken = default)
		{
			var format = await _formatRepository.GetByIdAsync(id, cancellationToken);
			if (format is null)
			{
				return false;
			}

			format.Name = dto.Name.Trim();
			format.Code = dto.Code?.Trim();

			_formatRepository.Update(format);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var format = await _formatRepository.GetByIdAsync(id, cancellationToken);
			if (format is null)
			{
				return false;
			}

			_formatRepository.Delete(format);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
		{
			await _cacheService.RemoveAsync(AllFormatsCacheKey, cancellationToken);
			if (id.HasValue)
			{
				await _cacheService.RemoveAsync(GetFormatCacheKey(id.Value), cancellationToken);
			}
			await _cacheService.RemoveByPrefixAsync("formats_", cancellationToken);
		}

		private static FormatDto MapToReadDto(Format format)
		{
			return new FormatDto
			{
				Id = format.Id,
				Name = format.Name,
				Code = format.Code,
			};
		}
	}
}
