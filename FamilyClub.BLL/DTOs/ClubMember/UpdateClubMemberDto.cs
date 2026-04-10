using System.ComponentModel.DataAnnotations;

namespace FamilyClub.BLL.DTOs.ClubMember;

public class UpdateClubMemberDto
{
    [Phone]
    public string? PhoneNumber { get; set; }

    public string? Name { get; set; }
    public string? Surname { get; set; }
    public DateOnly? DateOfBirth { get; set; }

}