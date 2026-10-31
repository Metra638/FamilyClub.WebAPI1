using System.Text;
using FamilyClub.BLL.Interfaces;
using FamilyClub.WebAPI.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace FamilyClub.WebAPI.Tests.Controllers;

public class ImagesControllerTests
{
    private readonly Mock<IStorageService> _storageServiceMock = new();
    private readonly ImagesController _controller;

    public ImagesControllerTests()
    {
        _controller = new ImagesController(_storageServiceMock.Object);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileIsNull()
    {
        // Act
        var result = await _controller.Upload(null!, "uploads", CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequest.Value);
    }

    [Fact]
    public async Task Upload_ReturnsBadRequest_WhenFileExtensionNotAllowed()
    {
        // Arrange
        var content = "dummy text";
        var file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes(content)), 0, content.Length, "file", "test.exe");

        // Act
        var result = await _controller.Upload(file, "uploads", CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequest.Value);
    }

    [Fact]
    public async Task Upload_ReturnsServiceUnavailable_WhenStorageNotConfigured()
    {
        // Arrange
        var content = "fake image content";
        var file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes(content)), 0, content.Length, "file", "photo.jpg");
        _storageServiceMock.Setup(s => s.IsConfigured).Returns(false);

        // Act
        var result = await _controller.Upload(file, "uploads", CancellationToken.None);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, objectResult.StatusCode);
    }

    [Fact]
    public async Task Upload_ReturnsOk_WhenUploadSucceeds()
    {
        // Arrange
        var content = "fake image content";
        var file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes(content)), 0, content.Length, "file", "cover.png")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/png"
        };
        _storageServiceMock.Setup(s => s.IsConfigured).Returns(true);
        _storageServiceMock.Setup(s => s.UploadFileAsync(file, "products", It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://cdn.example.com/products/cover.png");
        _storageServiceMock.Setup(s => s.ExtractKey("https://cdn.example.com/products/cover.png"))
            .Returns("products/cover.png");

        // Act
        var result = await _controller.Upload(file, "products", CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Delete_ReturnsBadRequest_WhenUrlOrKeyIsEmpty()
    {
        // Act
        var result = await _controller.Delete(new DeleteImageRequest { UrlOrKey = "" }, CancellationToken.None);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenDeletedSuccessfully()
    {
        // Arrange
        _storageServiceMock.Setup(s => s.DeleteAsync("products/cover.png", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(new DeleteImageRequest { UrlOrKey = "products/cover.png" }, CancellationToken.None);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}

