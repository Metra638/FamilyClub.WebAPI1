using System.ComponentModel.DataAnnotations;

namespace FamilyClub.BLL.DTOs.ClubMember;

public class ClubMemberReadDto
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    public string? Name { get; set; }
    public string? Surname { get; set; }
    public DateOnly? DateOfBirth { get; set; }

}
