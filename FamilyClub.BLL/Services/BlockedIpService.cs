using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.Extensions.Logging;

namespace FamilyClub.BLL.Services;

public class BlockedIpService : IBlockedIpService
{
    private readonly IBlockedIpRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;
    private readonly ILogger<BlockedIpService> _logger;

    private const string CacheKey = "BlockedIpsList";
    private readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public BlockedIpService(
        IBlockedIpRepository repository,
        IUnitOfWork unitOfWork,
        ICacheService cacheService,
        ILogger<BlockedIpService> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<bool> IsIpBlockedAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        var blockedIps = await GetCachedBlockedIpsAsync(cancellationToken);
        return blockedIps.Any(b => b.IpAddress == ipAddress);
    }

    public async Task<IEnumerable<BlockedIp>> GetAllBlockedIpsAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }

    public async Task AddBlockedIpAsync(string ipAddress, string? reason, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIpAsync(ipAddress, cancellationToken);
        if (existing == null)
        {
            var blockedIp = new BlockedIp
            {
                IpAddress = ipAddress,
                Reason = reason,
                CreatedAt = DateTime.UtcNow
            };
            
            await _repository.AddAsync(blockedIp, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            await _cacheService.RemoveAsync(CacheKey, cancellationToken);
            _logger.LogInformation("IP {IpAddress} has been blocked. Reason: {Reason}", ipAddress, reason);
        }
    }

    public async Task RemoveBlockedIpAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIpAsync(ipAddress, cancellationToken);
        if (existing != null)
        {
            _repository.Delete(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            await _cacheService.RemoveAsync(CacheKey, cancellationToken);
            _logger.LogInformation("IP {IpAddress} has been unblocked.", ipAddress);
        }
    }

    private async Task<IEnumerable<BlockedIp>> GetCachedBlockedIpsAsync(CancellationToken cancellationToken)
    {
        var blockedIps = await _cacheService.GetAsync<List<BlockedIp>>(CacheKey, cancellationToken);
        if (blockedIps is null)
        {
            var fromDb = await _repository.GetAllAsync(cancellationToken);
            blockedIps = fromDb.ToList();
            await _cacheService.SetAsync(CacheKey, blockedIps, CacheDuration, cancellationToken);
        }

        return blockedIps;
    }
}