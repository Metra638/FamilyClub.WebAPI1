using FamilyClub.BLL.DTOs.ActionLog;
using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Services
{
	public class AuthorService : IAuthorService
	{
		private readonly IAuthorRepository _authorRepository;
		private readonly IUnitOfWork _unitOfWork;
		private readonly IActionLogService _actionLog;
		private readonly ICacheService _cacheService;

		private const string AllAuthorsCacheKey = "authors_all";
		private static string GetAuthorCacheKey(int id) => $"authors_item_{id}";
		private static readonly SemaphoreSlim _authorsLock = new(1, 1);

		public AuthorService(
			IAuthorRepository authorRepository,
			IUnitOfWork unitOfWork,
			IActionLogService actionLog,
			ICacheService cacheService)
		{
			_authorRepository = authorRepository;
			_unitOfWork = unitOfWork;
			_actionLog = actionLog;
			_cacheService = cacheService;
		}

		public async Task<IEnumerable<AuthorDTO>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var cached = await _cacheService.GetAsync<List<AuthorDTO>>(AllAuthorsCacheKey, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			await _authorsLock.WaitAsync(cancellationToken);
			try
			{
				cached = await _cacheService.GetAsync<List<AuthorDTO>>(AllAuthorsCacheKey, CancellationToken.None);
				if (cached is not null)
				{
					return cached;
				}

				var authors = await _authorRepository.GetAllAsync(CancellationToken.None);
				var dtos = authors.Select(MapToReadDto).ToList();
				await _cacheService.SetAsync(AllAuthorsCacheKey, dtos, TimeSpan.FromMinutes(30), CancellationToken.None);
				return dtos;
			}
			finally
			{
				_authorsLock.Release();
			}
		}

		public async Task<AuthorDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var key = GetAuthorCacheKey(id);
			var cached = await _cacheService.GetAsync<AuthorDTO>(key, cancellationToken);
			if (cached is not null)
			{
				return cached;
			}

			var author = await _authorRepository.GetByIdAsync(id, cancellationToken);
			if (author is null)
			{
				return null;
			}

			var dto = MapToReadDto(author);
			await _cacheService.SetAsync(key, dto, TimeSpan.FromMinutes(30), cancellationToken);
			return dto;
		}

		public async Task<AuthorDTO> CreateAsync(AuthorDTO dto, CancellationToken cancellationToken = default)
		{
			var author = new Author
			{
				AuthorName = dto.AuthorName.Trim(),
				Biography = dto.Biography?.Trim(),
				PhotoUrl = dto.PhotoUrl,
			};

			await _authorRepository.AddAsync(author, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, author.Id);

			await SafeLogAsync(
				ActionLogCodes.Actions.Created,
				ActionLogCodes.Modules.Authors,
				$"Створено автора «{author.AuthorName}», Id={author.Id}",
				ActionLogCodes.Levels.Success,
				cancellationToken);

			return MapToReadDto(author);
		}

		public async Task<bool> UpdateAsync(int id, AuthorDTO dto, CancellationToken cancellationToken = default)
		{
			var author = await _authorRepository.GetByIdAsync(id, cancellationToken);
			if (author is null)
			{
				return false;
			}

			author.AuthorName = dto.AuthorName.Trim();
			author.Biography = dto.Biography?.Trim();
			author.PhotoUrl = dto.PhotoUrl;

			_authorRepository.Update(author);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var author = await _authorRepository.GetByIdAsync(id, cancellationToken);
			if (author is null)
			{
				return false;
			}

			var name = author.AuthorName;
			_authorRepository.Delete(author);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			await InvalidateCacheAsync(cancellationToken, id);

			await SafeLogAsync(
				ActionLogCodes.Actions.Deleted,
				ActionLogCodes.Modules.Authors,
				$"Видалено автора «{name}», Id={id}",
				ActionLogCodes.Levels.Warning,
				cancellationToken);

			return true;
		}

		private async Task InvalidateCacheAsync(CancellationToken cancellationToken, int? id = null)
		{
			await _cacheService.RemoveAsync(AllAuthorsCacheKey, cancellationToken);
			if (id.HasValue)
			{
				await _cacheService.RemoveAsync(GetAuthorCacheKey(id.Value), cancellationToken);
			}
			await _cacheService.RemoveByPrefixAsync("authors_", cancellationToken);
		}

		private async Task SafeLogAsync(
			string action,
			string module,
			string details,
			string level,
			CancellationToken cancellationToken)
		{
			try
			{
				await _actionLog.LogAsync(action, module, details, level, cancellationToken: cancellationToken);
			}
			catch
			{
			}
		}

		private static AuthorDTO MapToReadDto(Author author)
		{
			return new AuthorDTO
			{
				Id = author.Id,
				AuthorName = author.AuthorName,
				Biography = author.Biography,
				PhotoUrl = author.PhotoUrl,
			};
		}
	}
}
