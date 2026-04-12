using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.ClubMember
{
    public class AuthResponseClubMemberDTO
    {
        public ClubMemberReadDto ClubMember { get; set; } = null!;
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string? ReturnUrl { get; set; }
    }
}
