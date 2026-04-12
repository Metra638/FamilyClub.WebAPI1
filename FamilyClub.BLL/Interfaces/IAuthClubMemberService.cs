using FamilyClub.BLL.DTOs.ClubMember;

namespace FamilyClub.BLL.Interfaces;

public interface IAuthClubMemberService
{
    Task<AuthResponseClubMemberDTO> LoginAsync(LoginClubMemberDto dto, CancellationToken cancellationToken = default);
    Task<ClubMemberReadDto> RegisterAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default);
    Task LogoutAsync(CancellationToken cancellationToken = default);
}
