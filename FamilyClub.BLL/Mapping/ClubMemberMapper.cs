using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClubLibrary;

namespace FamilyClub.BLL.Mapping;

public static class ClubMemberMapper
{
    public static ClubMemberReadDto MapToReadDto(ClubMember clubMember, IEnumerable<string>? roles = null)
    {
        return new ClubMemberReadDto
        {
            Id = clubMember.Id,
            Email = clubMember.Email ?? clubMember.UserName!,
            Name = clubMember.Name,
            Surname = clubMember.Surname,
            PhoneNumber = clubMember.PhoneNumber!,
            DateOfBirth = clubMember.DateOfBirth,
            AvatarData = clubMember.AvatarData,
            AvatarUrl = clubMember.AvatarUrl,
            Roles = roles ?? new List<string>(),
            LockoutEnd = clubMember.LockoutEnd,
            LockedAt = clubMember.LockedAt,
            LockedBy = clubMember.LockedBy != null
                ? $"{clubMember.LockedBy.Name} {clubMember.LockedBy.Surname}".Trim()
                : null,
            LockoutReason = clubMember.BlockReason?.Name,
            LockoutReasonDetail = clubMember.LockoutComment,
        };
    }
}
