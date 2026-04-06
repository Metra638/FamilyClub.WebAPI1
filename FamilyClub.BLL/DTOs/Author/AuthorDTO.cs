using FamilyClubLibrary;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.Author
{
	public class AuthorDTO
	{
		public int Id { get; set; }

		public string AuthorName { get; set; } = default!;

		public string? Biography { get; set; }

		public string? PhotoUrl { get; set; }
	}
}
