using System.ComponentModel.DataAnnotations;

namespace FamilyClub.BLL.DTOs.ClubMember;

public class LoginClubMemberDto
{
    [Required]
    [Display(Name = "Email")]
    public string Username { get; set; } = default!;

    [Required]
    [Display(Name = "Password")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = default!;

    [Display(Name = "Remain in the system")]
    public bool RememberMe { get; set; }

    public string? ReturnUrl { get; set; }

}