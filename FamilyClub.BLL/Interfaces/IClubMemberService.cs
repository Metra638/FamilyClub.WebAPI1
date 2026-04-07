using FamilyClub.BLL.DTOs.ClubMember;

namespace FamilyClub.BLL.Interfaces;

public interface IClubMemberService
{
    Task<IEnumerable<RegisterClubMemberDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<RegisterClubMemberDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<RegisterClubMemberDto> CreateAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, RegisterClubMemberDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
