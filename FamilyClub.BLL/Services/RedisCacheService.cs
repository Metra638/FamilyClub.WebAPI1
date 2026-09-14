using System.Text.Json;
using FamilyClub.BLL.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace FamilyClub.BLL.Services;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IMemoryCache _memoryCache;
    private readonly IConnectionMultiplexer? _redisConnection;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly string _instanceName;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    public RedisCacheService(
        IDistributedCache distributedCache,
        IMemoryCache memoryCache,
        ILogger<RedisCacheService> logger,
        IConnectionMultiplexer? redisConnection = null,
        IConfiguration? configuration = null)
    {
        _distributedCache = distributedCache;
        _memoryCache = memoryCache;
        _logger = logger;
        _redisConnection = redisConnection;
        _instanceName = configuration?["CacheSettings:InstanceName"] ?? "FamilyClubCache_";
    }

    private bool IsRedisAvailable => _redisConnection is { IsConnected: true };

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        // 1. L1 Local Memory Cache (миттєвий відгук із пам'яті, 0 мережевих затримок)
        if (_memoryCache.TryGetValue(key, out T? localVal))
        {
            return localVal;
        }

        // 2. Якщо Redis не підключено і в пам'яті немає — промах кешу
        if (!IsRedisAvailable)
        {
            return default;
        }

        // 3. L2 Distributed Redis
        try
        {
            var cachedData = await _distributedCache.GetAsync(key, cancellationToken);
            if (cachedData is null || cachedData.Length == 0)
            {
                return default;
            }

            var value = JsonSerializer.Deserialize<T>(cachedData, JsonOptions);
            if (value is not null)
            {
                // Заповнюємо L1 кеш на 5 хвилин для прискорення наступних звернень
                _memoryCache.Set(key, value, TimeSpan.FromMinutes(5));
            }

            return value;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Redis недоступний при читанні ключа {Key}.", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        if (value is null)
        {
            return;
        }

        var ttl = expiration ?? TimeSpan.FromMinutes(15);
        // Безпечний L1 TTL (до 5 хв), щоб уникнути розсинхрону при горизонтальному масштабуванні
        var l1Ttl = ttl < TimeSpan.FromMinutes(5) ? ttl : TimeSpan.FromMinutes(5);
        _memoryCache.Set(key, value, l1Ttl);

        if (!IsRedisAvailable)
        {
            return;
        }

        try
        {
            var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            };

            await _distributedCache.SetAsync(key, bytes, options, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Redis недоступний при запису ключа {Key}.", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _memoryCache.Remove(key);

        if (!IsRedisAvailable)
        {
            return;
        }

        try
        {
            await _distributedCache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Redis недоступний при видаленні ключа {Key}.", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default)
    {
        _memoryCache.Remove(prefixKey);

        if (IsRedisAvailable && _redisConnection is not null)
        {
            try
            {
                var endpoints = _redisConnection.GetEndPoints();
                foreach (var endpoint in endpoints)
                {
                    var server = _redisConnection.GetServer(endpoint);
                    if (server.IsReplica) continue;

                    // Точний префіксний патерн із InstanceName без провідної зірочки (*)
                    var pattern = $"{_instanceName}{prefixKey}*";
                    var keys = server.Keys(pattern: pattern).ToArray();
                    if (keys.Length > 0)
                    {
                        var db = _redisConnection.GetDatabase();
                        await db.KeyDeleteAsync(keys);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Redis недоступний при інвалідації за префіксом {PrefixKey}.", prefixKey);
            }
        }
    }

    public Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(IsRedisAvailable);
    }
}
