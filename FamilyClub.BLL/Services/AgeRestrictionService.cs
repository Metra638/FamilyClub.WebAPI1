using FamilyClub.BLL.DTOs.AgeRestriction;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
	public class AgeRestrictionService : IAgeRestrictionService
	{
		private readonly IAgeRestrictionRepository _ageRestrictionRepository;
		private readonly IUnitOfWork _unitOfWork;
		private readonly ICacheService _cacheService;

		private const string AllAgeRestrictionsCacheKey = "agerestrictions_all";
		private static string GetAgeRestrictionCacheKey(int id) => $"agerestrictions_item_{id}";

		public AgeRestrictionService(
			IAgeRestrictionRepository ageRestrictionRepository,
			IUnitOfWork unitOfWork,
			ICacheService cacheService)
		{
			_ageRestrictionRepository = ageRestrictionRepository;
			_unitOfWork = unitOfWork;
			_cacheService = cacheService;
		}

		public async Task<IEnumerable<AgeRestrictionDto>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var cached = await _cacheService.GetAsync<List<AgeRestrictionDto>>(AllAgeRestrictionsCacheKey, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var ageRestrictions = await _ageRestrictionRepository.GetAllAsync(cancellationToken);
			var dtos = ageRestrictions.Select(MapToReadDto).ToList();
			await _cacheService.SetAsync(AllAgeRestrictionsCacheKey, dtos, TimeSpan.FromHours(1), cancellationToken);
			return dtos;
		}

		public async Task<AgeRestrictionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var key = GetAgeRestrictionCacheKey(id);
			var cached = await _cacheService.GetAsync<AgeRestrictionDto>(key, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var ageRestriction = await _ageRestrictionRepository.GetByIdAsync(id, cancellationToken);
			if (ageRestriction is null)
			{
				return null;
			}

			var dto = MapToReadDto(ageRestriction);
			await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
			return dto;
		}

		public async Task<AgeRestrictionDto> CreateAsync(AgeRestrictionDto dto, CancellationToken cancellationToken = default)
		{
			var ageRestriction = new AgeRestriction
			{
				Name = dto.Name.Trim(),
				Code = dto.Code?.Trim(),
			};

			await _ageRestrictionRepository.AddAsync(ageRestriction, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, ageRestriction.Id);

			return MapToReadDto(ageRestriction);
		}

		public async Task<bool> UpdateAsync(int id, AgeRestrictionDto dto, CancellationToken cancellationToken = default)
		{
			var ageRestriction = await _ageRestrictionRepository.GetByIdAsync(id, cancellationToken);
			if (ageRestriction is null)
			{
				return false;
			}

			ageRestriction.Name = dto.Name.Trim();
			ageRestriction.Code = dto.Code?.Trim();

			_ageRestrictionRepository.Update(ageRestriction);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var ageRestriction = await _ageRestrictionRepository.GetByIdAsync(id, cancellationToken);
			if (ageRestriction is null)
			{
				return false;
			}

			_ageRestrictionRepository.Delete(ageRestriction);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
		{
			await _cacheService.RemoveAsync(AllAgeRestrictionsCacheKey, cancellationToken);
			if (id.HasValue)
			{
				await _cacheService.RemoveAsync(GetAgeRestrictionCacheKey(id.Value), cancellationToken);
			}
			await _cacheService.RemoveByPrefixAsync("agerestrictions_", cancellationToken);
		}

		private static AgeRestrictionDto MapToReadDto(AgeRestriction ageRestriction)
		{
			return new AgeRestrictionDto
			{
				Id = ageRestriction.Id,
				Name = ageRestriction.Name,
				Code = ageRestriction.Code,
			};
		}
	}
}
