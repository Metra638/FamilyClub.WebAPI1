using FamilyClub.BLL.Options;
using FamilyClub.BLL.Services;
using Microsoft.Extensions.Logging;
using ExtOptions = Microsoft.Extensions.Options.Options;
using Moq;
using Xunit;

namespace FamilyClub.BLL.Tests.Services;

public class CloudflareR2StorageServiceTests
{
    private readonly Mock<ILogger<CloudflareR2StorageService>> _loggerMock = new();

    [Fact]
    public void IsConfigured_ReturnsFalse_WhenOptionsAreEmpty()
    {
        // Arrange
        var options = new CloudflareR2Options();
        var optionsWrapper = ExtOptions.Create(options);

        // Act
        var service = new CloudflareR2StorageService(optionsWrapper, _loggerMock.Object);

        // Assert
        Assert.False(service.IsConfigured);
    }

    [Fact]
    public void GetPublicUrl_UsesCustomPublicUrl_WhenConfigured()
    {
        // Arrange
        var options = new CloudflareR2Options
        {
            AccountId = "acc123",
            BucketName = "my-bucket",
            AccessKeyId = "key123",
            SecretAccessKey = "secret123",
            PublicUrl = "https://cdn.example.com"
        };
        var service = new CloudflareR2StorageService(ExtOptions.Create(options), _loggerMock.Object);

        // Act
        var url = service.GetPublicUrl("products/book1.jpg");

        // Assert
        Assert.Equal("https://cdn.example.com/products/book1.jpg", url);
    }

    [Fact]
    public void GetPublicUrl_ConstructsFromServiceUrlAndBucket_WhenNoPublicUrl()
    {
        // Arrange
        var options = new CloudflareR2Options
        {
            AccountId = "acc123",
            BucketName = "my-bucket",
            AccessKeyId = "key123",
            SecretAccessKey = "secret123"
        };
        var service = new CloudflareR2StorageService(ExtOptions.Create(options), _loggerMock.Object);

        // Act
        var url = service.GetPublicUrl("products/book1.jpg");

        // Assert
        Assert.Equal("https://acc123.r2.cloudflarestorage.com/my-bucket/products/book1.jpg", url);
    }

    [Theory]
    [InlineData("https://cdn.example.com/products/book1.jpg", "products/book1.jpg")]
    [InlineData("https://acc123.r2.cloudflarestorage.com/my-bucket/products/book1.jpg", "products/book1.jpg")]
    [InlineData("products/book1.jpg", "products/book1.jpg")]
    [InlineData("/products/book1.jpg", "products/book1.jpg")]
    public void ExtractKey_ExtractsRelativeKeyCorrectly(string input, string expected)
    {
        // Arrange
        var options = new CloudflareR2Options
        {
            AccountId = "acc123",
            BucketName = "my-bucket",
            AccessKeyId = "key123",
            SecretAccessKey = "secret123",
            PublicUrl = "https://cdn.example.com"
        };
        var service = new CloudflareR2StorageService(ExtOptions.Create(options), _loggerMock.Object);

        // Act
        var result = service.ExtractKey(input);

        // Assert
        Assert.Equal(expected, result);
    }
}
