using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.Interfaces;
using FamilyClub.WebAPI.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace FamilyClub.WebAPI.Tests.Controllers
{
    public class AuthorsControllerTests
    {
        private readonly Mock<IAuthorService> _authorServiceMock;
        private readonly Mock<IStorageService> _storageServiceMock;
        private readonly AuthorsController _controller;

        public AuthorsControllerTests()
        {
            _authorServiceMock = new Mock<IAuthorService>();
            _storageServiceMock = new Mock<IStorageService>();
            _controller = new AuthorsController(_authorServiceMock.Object, _storageServiceMock.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResultWithAuthorsList()
        {
            // Arrange
            var authors = new List<AuthorDTO>
            {
                new AuthorDTO { Id = 1, AuthorName = "Author 1" },
                new AuthorDTO { Id = 2, AuthorName = "Author 2" }
            };
            _authorServiceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(authors);

            // Act
            var actionResult = await _controller.GetAll(CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnAuthors = Assert.IsAssignableFrom<IEnumerable<AuthorDTO>>(okResult.Value);
            Assert.Equal(2, returnAuthors.Count());
        }

        [Fact]
        public async Task GetById_WhenAuthorExists_ReturnsOkWithAuthor()
        {
            // Arrange
            var author = new AuthorDTO { Id = 1, AuthorName = "Test Author" };
            _authorServiceMock.Setup(s => s.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(author);

            // Act
            var actionResult = await _controller.GetById(1, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnAuthor = Assert.IsType<AuthorDTO>(okResult.Value);
            Assert.Equal(1, returnAuthor.Id);
            Assert.Equal("Test Author", returnAuthor.AuthorName);
        }

        [Fact]
        public async Task GetById_WhenAuthorDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            _authorServiceMock.Setup(s => s.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync((AuthorDTO?)null);

            // Act
            var actionResult = await _controller.GetById(99, CancellationToken.None);

            // Assert
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtActionResultWithCreatedAuthor()
        {
            // Arrange
            var inputDto = new AuthorDTO { AuthorName = "New Author" };
            var createdDto = new AuthorDTO { Id = 10, AuthorName = "New Author" };

            _authorServiceMock.Setup(s => s.CreateAsync(inputDto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(inputDto, CancellationToken.None);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(AuthorsController.GetById), createdResult.ActionName);
            Assert.Equal(10, createdResult.RouteValues?["id"]);
            Assert.Equal(createdDto, createdResult.Value);
        }

        [Fact]
        public async Task Update_WhenSuccess_ReturnsNoContent()
        {
            // Arrange
            var dto = new AuthorDTO { AuthorName = "Updated Author" };
            _authorServiceMock.Setup(s => s.UpdateAsync(1, dto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, dto, CancellationToken.None);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Update_WhenNotFound_ReturnsNotFound()
        {
            // Arrange
            var dto = new AuthorDTO { AuthorName = "Updated Author" };
            _authorServiceMock.Setup(s => s.UpdateAsync(99, dto, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(99, dto, CancellationToken.None);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_WhenSuccess_ReturnsNoContent()
        {
            // Arrange
            _authorServiceMock.Setup(s => s.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new AuthorDTO { Id = 1, AuthorName = "Author 1" });
            _authorServiceMock.Setup(s => s.DeleteAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1, CancellationToken.None);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_WhenNotFound_ReturnsNotFound()
        {
            // Arrange
            _authorServiceMock.Setup(s => s.DeleteAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(99, CancellationToken.None);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
