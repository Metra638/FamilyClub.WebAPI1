using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.DAL.EF.DB
{
	// Class to initialize database with starting data
	public class DbInitializer
	{
		public static async Task Initialize(
			IServiceProvider serviceProvider,
			IConfiguration configuration)
		{
			DbContextOptions<FamilyClubContext> options =
				serviceProvider.GetRequiredService<DbContextOptions<FamilyClubContext>>();

			using (FamilyClubContext context = new FamilyClubContext(options))
			{
				await context.Database.EnsureCreatedAsync();
			}

		}
	}
}
