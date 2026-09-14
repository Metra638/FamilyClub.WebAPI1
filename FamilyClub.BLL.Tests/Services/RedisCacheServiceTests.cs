using System.Text.Json;
using FamilyClub.BLL.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace FamilyClub.BLL.Tests.Services;

public class RedisCacheServiceTests
{
    private readonly IMemoryCache _memoryCache;
    private readonly Mock<IDistributedCache> _distributedCacheMock;
    private readonly Mock<ILogger<RedisCacheService>> _loggerMock;
    private readonly RedisCacheService _cacheService;

    public RedisCacheServiceTests()
    {
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _distributedCacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<RedisCacheService>>();

        _cacheService = new RedisCacheService(
            _distributedCacheMock.Object,
            _memoryCache,
            _loggerMock.Object);
    }

    [Fact]
    public async Task GetAsync_WhenValueInLocalMemory_ReturnsWithoutCallingDistributedCache()
    {
        // Arrange
        const string key = "test_key";
        const string expectedValue = "cached_in_memory";
        _memoryCache.Set(key, expectedValue);

        // Act
        var result = await _cacheService.GetAsync<string>(key);

        // Assert
        Assert.Equal(expectedValue, result);
        _distributedCacheMock.Verify(d => d.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SetAsync_WritesToLocalMemory()
    {
        // Arrange
        const string key = "test_set_key";
        const string value = "hello_world";

        // Act
        await _cacheService.SetAsync(key, value);

        // Assert
        Assert.True(_memoryCache.TryGetValue(key, out string? cachedValue));
        Assert.Equal(value, cachedValue);
    }

    [Fact]
    public async Task RemoveAsync_RemovesFromLocalMemory()
    {
        // Arrange
        const string key = "test_remove_key";
        _memoryCache.Set(key, "data");

        // Act
        await _cacheService.RemoveAsync(key);

        // Assert
        Assert.False(_memoryCache.TryGetValue(key, out _));
    }
}
