using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClubLibrary
{
    public class User : IdentityUser
    {
        public string? Name { get; set; }

        public string? Surname { get; set; }

        public DateOnly? DateOfBirth { get; set; }


        // To see all orders/reviews for a specific User
        public List<Order> Orders { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();


    }
}
