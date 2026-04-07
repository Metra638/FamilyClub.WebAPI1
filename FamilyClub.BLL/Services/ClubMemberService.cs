using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Identity;
using System.Xml.Linq;

namespace FamilyClub.BLL.Services;

public class ClubMemberService : IClubMemberService
{
    private readonly IClubMemberRepository _clubMemberRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ClubMember> _userManager;

    public ClubMemberService(IClubMemberRepository clubMemberRepository, IUnitOfWork unitOfWork, UserManager<ClubMember> userManager)
    {
        _clubMemberRepository = clubMemberRepository;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<IEnumerable<ClubMemberReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var clubMembers = await _clubMemberRepository.GetAllAsync(cancellationToken);
        return clubMembers.Select(MapToReadDto);
    }

    public async Task<ClubMemberReadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var clubMember = await _clubMemberRepository.GetByIdAsync(id, cancellationToken);
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

    public async Task<bool> UpdateAsync(int id, UpdateClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var clubMember = await _clubMemberRepository.GetByIdAsync(id, cancellationToken);
        if (clubMember is null)
        {
            return false;
        }
        clubMember.Name = dto.Name;
        clubMember.Surname = dto.Surname;
        clubMember.PhoneNumber = dto.PhoneNumber;
        clubMember.DateOfBirth = dto.DateOfBirth;

        _clubMemberRepository.Update(clubMember);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var clubMember = await _clubMemberRepository.GetByIdAsync(id, cancellationToken);
        if (clubMember is null)
        {
            return false;
        }

        _clubMemberRepository.Delete(clubMember);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }


    // Always returning ReadMapToReadDto to ensure consistent output format
    private static ClubMemberReadDto MapToReadDto(ClubMember clubMember)
    {
        return new ClubMemberReadDto
        {
            Id = clubMember.Id,
            Email = clubMember.Email ?? clubMember.UserName,
            Name = clubMember.Name,
            Surname = clubMember.Surname,
            PhoneNumber = clubMember.PhoneNumber,
            DateOfBirth = clubMember.DateOfBirth
        };
    }
}

