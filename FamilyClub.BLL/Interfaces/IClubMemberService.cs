using FamilyClub.BLL.DTOs.ClubMember;

namespace FamilyClub.BLL.Interfaces;

public interface IClubMemberService
{
    Task<IEnumerable<ClubMemberReadDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ClubMemberReadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ClubMemberReadDto> CreateAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default); // We are using RegisterClubMemberDto for creation, but returning ClubMemberReadDto
    Task<bool> UpdateAsync(int id, UpdateClubMemberDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
