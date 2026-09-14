using FamilyClub.BLL.DTOs.Language;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
    public class LanguageService : ILanguageService
    {
        private readonly ILanguageRepository _languageRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;

        private const string AllLanguagesCacheKey = "languages_all";
        private static string GetLanguageCacheKey(int id) => $"languages_item_{id}";
        private static readonly SemaphoreSlim _languagesLock = new(1, 1);

        public LanguageService(
            ILanguageRepository languageRepository,
            IUnitOfWork unitOfWork,
            ICacheService cacheService)
        {
            _languageRepository = languageRepository;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }

        public async Task<IEnumerable<LanguageDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var cached = await _cacheService.GetAsync<List<LanguageDto>>(AllLanguagesCacheKey, cancellationToken);
            if (cached is not null)
            {
                return cached;
            }

            await _languagesLock.WaitAsync(cancellationToken);
            try
            {
                cached = await _cacheService.GetAsync<List<LanguageDto>>(AllLanguagesCacheKey, CancellationToken.None);
                if (cached is not null)
                {
                    return cached;
                }

                var languages = await _languageRepository.GetAllAsync(CancellationToken.None);
                var dtos = languages.Select(MapToReadDto).ToList();
                await _cacheService.SetAsync(AllLanguagesCacheKey, dtos, TimeSpan.FromHours(1), CancellationToken.None);
                return dtos;
            }
            finally
            {
                _languagesLock.Release();
            }
        }

        public async Task<LanguageDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var key = GetLanguageCacheKey(id);
            var cached = await _cacheService.GetAsync<LanguageDto>(key, cancellationToken);
            if (cached is not null)
            {
                return cached;
            }

            var language = await _languageRepository.GetByIdAsync(id, cancellationToken);
            if (language is null)
            {
                return null;
            }

            var dto = MapToReadDto(language);
            await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
            return dto;
        }

        public async Task<LanguageDto> CreateAsync(LanguageDto dto, CancellationToken cancellationToken = default)
        {
            var language = new Language
            {
                LanguageName = dto.LanguageName.Trim()
            };

            await _languageRepository.AddAsync(language, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, language.Id);

            return MapToReadDto(language);
        }

        public async Task<bool> UpdateAsync(int id, LanguageDto dto, CancellationToken cancellationToken = default)
        {
            var language = await _languageRepository.GetByIdAsync(id, cancellationToken);
            if (language is null)
            {
                return false;
            }

            language.LanguageName = dto.LanguageName.Trim();
            _languageRepository.Update(language);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, id);

            return true;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var language = await _languageRepository.GetByIdAsync(id, cancellationToken);
            if (language is null)
            {
                return false;
            }

            _languageRepository.Delete(language);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, id);

            return true;
        }

        private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
        {
            await _cacheService.RemoveAsync(AllLanguagesCacheKey, cancellationToken);
            if (id.HasValue)
            {
                await _cacheService.RemoveAsync(GetLanguageCacheKey(id.Value), cancellationToken);
            }
            await _cacheService.RemoveByPrefixAsync("languages_", cancellationToken);
        }

        private static LanguageDto MapToReadDto(Language language)
        {
            return new LanguageDto
            {
                Id = language.Id,
                LanguageName = language.LanguageName
            };
        }
    }
}
