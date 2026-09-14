using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Moq;
using Xunit;

namespace FamilyClub.BLL.Tests.Services
{
    public class AuthorServiceTests
    {
        private readonly Mock<IAuthorRepository> _authorRepoMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IActionLogService> _actionLogMock;
        private readonly Mock<ICacheService> _cacheServiceMock;
        private readonly AuthorService _authorService;

        public AuthorServiceTests()
        {
            _authorRepoMock = new Mock<IAuthorRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _actionLogMock = new Mock<IActionLogService>();
            _cacheServiceMock = new Mock<ICacheService>();

            _authorService = new AuthorService(
                _authorRepoMock.Object,
                _unitOfWorkMock.Object,
                _actionLogMock.Object,
                _cacheServiceMock.Object);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsMappedAuthorDTOs()
        {
            // Arrange
            var authors = new List<Author>
            {
                new Author { Id = 1, AuthorName = "Taras Shevchenko", Biography = "Poet", PhotoUrl = "pic1.jpg" },
                new Author { Id = 2, AuthorName = "Lesya Ukrainka", Biography = "Writer", PhotoUrl = "pic2.jpg" }
            };

            _authorRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(authors);

            // Act
            var result = await _authorService.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            var list = result.ToList();
            Assert.Equal(2, list.Count);
            Assert.Equal("Taras Shevchenko", list[0].AuthorName);
            Assert.Equal("Lesya Ukrainka", list[1].AuthorName);
        }

        [Fact]
        public async Task GetByIdAsync_WhenAuthorExists_ReturnsMappedAuthorDTO()
        {
            // Arrange
            var author = new Author { Id = 1, AuthorName = "Ivan Franko", Biography = "Poet", PhotoUrl = "franko.jpg" };
            _authorRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(author);

            // Act
            var result = await _authorService.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Ivan Franko", result.AuthorName);
        }

        [Fact]
        public async Task GetByIdAsync_WhenAuthorDoesNotExist_ReturnsNull()
        {
            // Arrange
            _authorRepoMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Author?)null);

            // Act
            var result = await _authorService.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_AddsAuthorAndSavesChanges()
        {
            // Arrange
            var dto = new AuthorDTO
            {
                AuthorName = "  Hryhorii Skovoroda  ",
                Biography = " Philosopher ",
                PhotoUrl = "skovoroda.jpg"
            };

            _authorRepoMock.Setup(r => r.AddAsync(It.IsAny<Author>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            var result = await _authorService.CreateAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Hryhorii Skovoroda", result.AuthorName);
            Assert.Equal("Philosopher", result.Biography);

            _authorRepoMock.Verify(r => r.AddAsync(It.Is<Author>(a => a.AuthorName == "Hryhorii Skovoroda"), It.IsAny<CancellationToken>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenAuthorExists_UpdatesAndReturnsTrue()
        {
            // Arrange
            var author = new Author { Id = 1, AuthorName = "Old Name", Biography = "Old Bio" };
            _authorRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(author);

            var updateDto = new AuthorDTO
            {
                AuthorName = "  New Name  ",
                Biography = "  New Bio  ",
                PhotoUrl = "new.jpg"
            };

            // Act
            var success = await _authorService.UpdateAsync(1, updateDto);

            // Assert
            Assert.True(success);
            Assert.Equal("New Name", author.AuthorName);
            Assert.Equal("New Bio", author.Biography);
            _authorRepoMock.Verify(r => r.Update(author), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WhenAuthorDoesNotExist_ReturnsFalse()
        {
            // Arrange
            _authorRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Author?)null);

            var updateDto = new AuthorDTO { AuthorName = "Test" };

            // Act
            var success = await _authorService.UpdateAsync(99, updateDto);

            // Assert
            Assert.False(success);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task DeleteAsync_WhenAuthorExists_DeletesAndReturnsTrue()
        {
            // Arrange
            var author = new Author { Id = 5, AuthorName = "Author to delete" };
            _authorRepoMock.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(author);

            // Act
            var success = await _authorService.DeleteAsync(5);

            // Assert
            Assert.True(success);
            _authorRepoMock.Verify(r => r.Delete(author), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenAuthorDoesNotExist_ReturnsFalse()
        {
            // Arrange
            _authorRepoMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Author?)null);

            // Act
            var success = await _authorService.DeleteAsync(999);

            // Assert
            Assert.False(success);
            _authorRepoMock.Verify(r => r.Delete(It.IsAny<Author>()), Times.Never);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}
