using FamilyClub.BLL.DTOs.ActionLog;
using FamilyClub.BLL.DTOs.PlatformSettings;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services;

public class PlatformSettingsService : IPlatformSettingsService
{
    private readonly IPlatformSettingsRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IActionLogService _actionLog;
    private readonly ICacheService _cacheService;

    private const string SettingsCacheKey = "platform_settings_singleton";
    private static readonly SemaphoreSlim _settingsLock = new(1, 1);

    public PlatformSettingsService(
        IPlatformSettingsRepository repository,
        IUnitOfWork unitOfWork,
        IActionLogService actionLog,
        ICacheService cacheService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _actionLog = actionLog;
        _cacheService = cacheService;
    }

    public async Task<PlatformSettingsDto> GetAsync(CancellationToken cancellationToken = default)
    {
        var cachedSettings = await _cacheService.GetAsync<PlatformSettingsDto>(SettingsCacheKey, cancellationToken);
        if (cachedSettings is not null)
        {
            return cachedSettings;
        }

        await _settingsLock.WaitAsync(cancellationToken);
        try
        {
            cachedSettings = await _cacheService.GetAsync<PlatformSettingsDto>(SettingsCacheKey, CancellationToken.None);
            if (cachedSettings is not null)
            {
                return cachedSettings;
            }

            var entity = await _repository.GetSingletonAsync(CancellationToken.None);
            if (entity is null)
            {
                entity = CreateDefault();
                await _repository.AddAsync(entity, CancellationToken.None);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);
            }

            var dto = Map(entity);
            await _cacheService.SetAsync(SettingsCacheKey, dto, TimeSpan.FromHours(1), CancellationToken.None);

            return dto;
        }
        finally
        {
            _settingsLock.Release();
        }
    }

    public async Task<PlatformSettingsDto> UpdateAsync(
        PlatformSettingsDto dto,
        CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetSingletonAsync(cancellationToken);
        if (entity is null)
        {
            entity = CreateDefault();
            await _repository.AddAsync(entity, cancellationToken);
        }

        var previousMaintenance = entity.MaintenanceMode;

        entity.CompanyName = string.IsNullOrWhiteSpace(dto.CompanyName)
            ? "Ink & Echo"
            : dto.CompanyName.Trim();
        entity.Slogan = dto.Slogan?.Trim();
        entity.SupportEmail = dto.SupportEmail?.Trim();
        entity.SupportPhone = dto.SupportPhone?.Trim();
        entity.CompanyAddress = dto.CompanyAddress?.Trim();
        entity.BooksPerPage = dto.BooksPerPage > 0 ? dto.BooksPerPage : 12;
        entity.MaxFileSizeMb = dto.MaxFileSizeMb > 0 ? dto.MaxFileSizeMb : 10;
        entity.AllowedFileFormats = string.IsNullOrWhiteSpace(dto.AllowedFileFormats)
            ? "jpg, png, webp, pdf"
            : dto.AllowedFileFormats.Trim();
        entity.ImageResizeMode = string.IsNullOrWhiteSpace(dto.ImageResizeMode)
            ? "1920"
            : dto.ImageResizeMode.Trim();

        // Keep previous media if client sends null (partial updates from section forms)
        if (dto.LogoData != null)
        {
            entity.LogoData = NormalizeMedia(dto.LogoData);
            entity.LogoContentType = dto.LogoContentType;
        }
        if (dto.IconData != null)
        {
            entity.IconData = NormalizeMedia(dto.IconData);
            entity.IconContentType = dto.IconContentType;
        }
        if (dto.BannerData != null)
        {
            entity.BannerData = NormalizeMedia(dto.BannerData);
            entity.BannerContentType = dto.BannerContentType;
        }

        entity.MaintenanceMode = dto.MaintenanceMode;
        entity.MaintenanceMessage = string.IsNullOrWhiteSpace(dto.MaintenanceMessage)
            ? "Ми проводимо технічні роботи. Скоро сервіс знову запрацює!"
            : dto.MaintenanceMessage.Trim();
        if (entity.MaintenanceMessage.Length > 2000)
            entity.MaintenanceMessage = entity.MaintenanceMessage[..2000];

        entity.UpdatedAt = DateTime.UtcNow;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _cacheService.RemoveAsync(SettingsCacheKey, cancellationToken);

        if (previousMaintenance != entity.MaintenanceMode)
        {
            try
            {
                await _actionLog.LogAsync(
                    entity.MaintenanceMode
                        ? ActionLogCodes.Actions.MaintenanceEnabled
                        : ActionLogCodes.Actions.MaintenanceDisabled,
                    ActionLogCodes.Modules.Platform,
                    entity.MaintenanceMode
                        ? "Увімкнено режим обслуговування"
                        : "Вимкнено режим обслуговування",
                    ActionLogCodes.Levels.Warning,
                    cancellationToken: cancellationToken);
            }
            catch
            {
            }
        }

        return Map(entity);
    }

    private static PlatformSettings CreateDefault() => new()
    {
        Id = 1,
        CompanyName = "Ink & Echo",
        Slogan = "Книгарня з характером",
        SupportEmail = "LibrellisSupport@proton.me",
        SupportPhone = "+380 00 000 00 00",
        CompanyAddress = "Україна",
        BooksPerPage = 12,
        MaxFileSizeMb = 10,
        AllowedFileFormats = "jpg, png, webp, pdf",
        ImageResizeMode = "1920",
        MaintenanceMode = false,
        MaintenanceMessage = "Ми проводимо технічні роботи. Скоро сервіс знову запрацює!",
        UpdatedAt = DateTime.UtcNow,
    };

    private static string? NormalizeMedia(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim();
    }

    private static PlatformSettingsDto Map(PlatformSettings e) => new()
    {
        Id = e.Id,
        CompanyName = e.CompanyName,
        Slogan = e.Slogan,
        SupportEmail = e.SupportEmail,
        SupportPhone = e.SupportPhone,
        CompanyAddress = e.CompanyAddress,
        BooksPerPage = e.BooksPerPage,
        MaxFileSizeMb = e.MaxFileSizeMb,
        AllowedFileFormats = e.AllowedFileFormats,
        ImageResizeMode = e.ImageResizeMode,
        LogoData = e.LogoData,
        LogoContentType = e.LogoContentType,
        IconData = e.IconData,
        IconContentType = e.IconContentType,
        BannerData = e.BannerData,
        BannerContentType = e.BannerContentType,
        MaintenanceMode = e.MaintenanceMode,
        MaintenanceMessage = e.MaintenanceMessage,
        UpdatedAt = e.UpdatedAt,
    };
}
