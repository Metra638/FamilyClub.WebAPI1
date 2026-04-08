using FamilyClub.BLL.DTOs.ClubMember;

namespace FamilyClub.BLL.Interfaces;

public interface IClubMemberService
{
    Task<IEnumerable<ClubMemberReadDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ClubMemberReadDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<ClubMemberReadDto> CreateAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default); // We are using RegisterClubMemberDto for creation, but returning ClubMemberReadDto
    Task<bool> UpdateAsync(string id, UpdateClubMemberDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    // Added methods compare to Repository from DAL
    Task<ClubMemberReadDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<List<ClubMemberReadDto>> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
}
