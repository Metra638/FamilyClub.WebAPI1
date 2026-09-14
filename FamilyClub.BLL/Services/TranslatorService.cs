using FamilyClub.BLL.DTOs.Translator;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
    public class TranslatorService : ITranslatorService
    {
        private readonly ITranslatorRepository _translatorRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;

        private const string AllTranslatorsCacheKey = "translators_all";
        private static string GetTranslatorCacheKey(int id) => $"translators_item_{id}";

        public TranslatorService(
            ITranslatorRepository translatorRepository,
            IUnitOfWork unitOfWork,
            ICacheService cacheService)
        {
            _translatorRepository = translatorRepository;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }

        public async Task<IEnumerable<TranslatorDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var cached = await _cacheService.GetAsync<List<TranslatorDto>>(AllTranslatorsCacheKey, cancellationToken);
            if (cached is not null)
            {
                return cached;
            }

            var translators = await _translatorRepository.GetAllAsync(cancellationToken);
            var dtos = translators.Select(MapToReadDto).ToList();
            await _cacheService.SetAsync(AllTranslatorsCacheKey, dtos, TimeSpan.FromHours(1), cancellationToken);
            return dtos;
        }

        public async Task<TranslatorDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var key = GetTranslatorCacheKey(id);
            var cached = await _cacheService.GetAsync<TranslatorDto>(key, cancellationToken);
            if (cached is not null)
            {
                return cached;
            }

            var translator = await _translatorRepository.GetByIdAsync(id, cancellationToken);
            if (translator is null)
            {
                return null;
            }

            var dto = MapToReadDto(translator);
            await _cacheService.SetAsync(key, dto, TimeSpan.FromHours(1), cancellationToken);
            return dto;
        }

        public async Task<TranslatorDto> CreateAsync(TranslatorDto dto, CancellationToken cancellationToken = default)
        {
            var translator = new Translator
            {
                TranslatorName = dto.TranslatorName.Trim()
            };

            await _translatorRepository.AddAsync(translator, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, translator.Id);

            return MapToReadDto(translator);
        }

        public async Task<bool> UpdateAsync(int id, TranslatorDto dto, CancellationToken cancellationToken = default)
        {
            var translator = await _translatorRepository.GetByIdAsync(id, cancellationToken);
            if (translator is null)
            {
                return false;
            }

            translator.TranslatorName = dto.TranslatorName.Trim();
            _translatorRepository.Update(translator);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, id);

            return true;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var translator = await _translatorRepository.GetByIdAsync(id, cancellationToken);
            if (translator is null)
            {
                return false;
            }

            _translatorRepository.Delete(translator);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await InvalidateCacheAsync(cancellationToken, id);

            return true;
        }

        private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
        {
            await _cacheService.RemoveAsync(AllTranslatorsCacheKey, cancellationToken);
            if (id.HasValue)
            {
                await _cacheService.RemoveAsync(GetTranslatorCacheKey(id.Value), cancellationToken);
            }
            await _cacheService.RemoveByPrefixAsync("translators_", cancellationToken);
        }

        private static TranslatorDto MapToReadDto(Translator translator)
        {
            return new TranslatorDto
            {
                Id = translator.Id,
                TranslatorName = translator.TranslatorName
            };
        }
    }
}
