using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;

namespace FamilyClub.BLL.Services;

public class ClubMemberService : IClubMemberService
{
    private readonly IUnitOfWork _unitOfWork; // We do not use it now, but it can be used later if we decide to update some other entities together with ClubMember
    private readonly UserManager<ClubMember> _userManager;

    public ClubMemberService(IUnitOfWork unitOfWork, UserManager<ClubMember> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<IEnumerable<ClubMemberReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var clubMembers = await _userManager.Users.ToListAsync<ClubMember>(cancellationToken);
        return clubMembers.Select(MapToReadDto);
    }

    public async Task<ClubMemberReadDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the operation

        var clubMember = await _userManager.FindByIdAsync(id);
        return clubMember is null ? null : MapToReadDto(clubMember);
    }

    public async Task<ClubMemberReadDto> CreateAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var clubMember = new ClubMember
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name,
            Surname = dto.Surname,
            PhoneNumber = dto.PhoneNumber,
            DateOfBirth = dto.DateOfBirth,
        };

        // 1. Using UserManager instead of Repository for creating
        var result = await _userManager.CreateAsync(clubMember, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Registration error: {errors}");
        }

        return MapToReadDto(clubMember);
    }

    public async Task<bool> UpdateAsync(string id, UpdateClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var clubMember = await _userManager.FindByIdAsync(id);
        if (clubMember is null)
        {
            return false;
        }
        clubMember.Name = dto.Name;
        clubMember.Surname = dto.Surname;
        clubMember.PhoneNumber = dto.PhoneNumber;
        clubMember.DateOfBirth = dto.DateOfBirth;

        cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the update operation

        var result = await _userManager.UpdateAsync(clubMember);
        if (!result.Succeeded) return false;

        return true;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var clubMember = await _userManager.FindByIdAsync(id);
        if (clubMember is null)
        {
            return false;
        }

        await _userManager.DeleteAsync(clubMember);

        return true;
    }

    public async Task<ClubMemberReadDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the operation

        var clubMember = await _userManager.FindByEmailAsync(email);
        return clubMember is null ? null : MapToReadDto(clubMember);
    }

    // Method is searching for clubMembers with the specified phone number and returns a list of matching members.
    public async Task<List<ClubMemberReadDto>> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var members = await _userManager.Users
            .Where(m => m.PhoneNumber == phoneNumber)
            .ToListAsync(cancellationToken);

        return MapToReadDtos(members)!;
    }

    // We always return ReadMapToReadDto to ensure consistent output format
    private static ClubMemberReadDto MapToReadDto(ClubMember clubMember)
    {
        return new ClubMemberReadDto
        {
            Id = clubMember.Id,
            Email = clubMember.Email ?? clubMember.UserName!,
            Name = clubMember.Name,
            Surname = clubMember.Surname,
            PhoneNumber = clubMember.PhoneNumber!,
            DateOfBirth = clubMember.DateOfBirth
        };
    }

    private static List<ClubMemberReadDto> MapToReadDtos(List<ClubMember> clubMembers)
    {
        return clubMembers.Select(MapToReadDto).ToList();
    }

}

