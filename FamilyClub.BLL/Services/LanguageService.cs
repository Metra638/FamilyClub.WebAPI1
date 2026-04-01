using FamilyClub.BLL.DTOs.Language;
using FamilyClub.BLL.DTOs.Publisher;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClub.DAL.Repositories;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
    public class LanguageService : ILanguageService
    {
        private readonly ILanguageRepository _languageRepository;
        private readonly IUnitOfWork _unitOfWork;
        public LanguageService(ILanguageRepository languageRepository, IUnitOfWork unitOfWork)
        {
            _languageRepository = languageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<LanguageDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var languages = await _languageRepository.GetAllAsync(cancellationToken);
            return languages.Select(MapToReadDto);
        }

        public async Task<LanguageDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var language = await _languageRepository.GetByIdAsync(id, cancellationToken);
            return language is null ? null : MapToReadDto(language);
        }

        public async Task<LanguageDto> CreateAsync(LanguageDto dto, CancellationToken cancellationToken = default)
        {
            var language = new Language
            {
                LanguageName = dto.LanguageName.Trim()
            };

            await _languageRepository.AddAsync(language, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

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

            return true;
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
