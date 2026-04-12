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
	// Class to initialize database
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


            /////////////////////////////////////////////
            /// ROLES
            /////////////////////////////////////////////
            // Getting Identity managers
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ClubMember>>();
			// Creating basic roles
			string[] roleNames = { "Admin", "User", "Manager" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

			// Creating basic Administrator
			var adminEmail = "admin@familyclub.com";
			var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var admin = new ClubMember
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    Name = "System",
                    Surname = "Admin",
                    EmailConfirmed = true, // Important for Identity
                    PhoneNumber = "0000000000"
                };

                // Password must correspond to Our requirements
                var result = await userManager.CreateAsync(admin, "{AdminFamilyClub*777!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
	}
}
