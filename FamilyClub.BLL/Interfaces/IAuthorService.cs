using FamilyClub.BLL.DTOs.Author;
using FamilyClub.BLL.DTOs.Publisher;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.Interfaces
{
	public interface IAuthorService
	{
		Task<IEnumerable<AuthorDTO>> GetAllAsync(CancellationToken cancellationToken = default);
		Task<AuthorDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
		Task<AuthorDTO> CreateAsync(AuthorDTO dto, CancellationToken cancellationToken = default);
		Task<bool> UpdateAsync(int id, AuthorDTO dto, CancellationToken cancellationToken = default);
		Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
	}
}
