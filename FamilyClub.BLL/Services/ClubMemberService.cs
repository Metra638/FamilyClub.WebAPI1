using FamilyClub.BLL.DTOs.ActionLog;
using FamilyClub.BLL.DTOs.ClubMember;
using FamilyClub.BLL.DTOs.Product;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Mapping;
using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyClub.BLL.Services;


// Method used by `admin` to manage club members (CRUD operations).
public class ClubMemberService : IClubMemberService
{
    private readonly FamilyClubContext _context;
    private readonly IUnitOfWork _unitOfWork; // We do not use it now, but it can be used later if we decide to update some other entities together with ClubMember
    private readonly UserManager<ClubMember> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IActionLogService _actionLog;
    private readonly IStorageService _storageService;

    public ClubMemberService(
        IUnitOfWork unitOfWork,
        UserManager<ClubMember> userManager,
        RoleManager<IdentityRole> roleManager,
        FamilyClubContext context,
        IActionLogService actionLog,
        IStorageService storageService)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _actionLog = actionLog;
        _storageService = storageService;
    }

    public async Task<IEnumerable<ClubMemberReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        //var members = await _userManager.Users.ToListAsync(cancellationToken);
        var members = await _userManager.Users
        .Include(m => m.BlockReason)
        .Include(m => m.LockedBy)
        .ToListAsync(cancellationToken);
        var dtos = new List<ClubMemberReadDto>();

        foreach (var member in members)
        {
            var roles = await _userManager.GetRolesAsync(member);
            dtos.Add(ClubMemberMapper.MapToReadDto(member, roles));
        }

        return dtos;
    }

    public async Task<ClubMemberReadDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the operation

        //var clubMember = await _userManager.FindByIdAsync(id);
        var clubMember = await _userManager.Users
        .Include(m => m.BlockReason)
        .Include(m => m.LockedBy)
        .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (clubMember == null) return null;

        var roles = await _userManager.GetRolesAsync(clubMember);
        return ClubMemberMapper.MapToReadDto(clubMember, roles);
    }

    public async Task<ClubMemberReadDto> CreateAsync(RegisterClubMemberDto dto, CancellationToken cancellationToken = default, IFormFile? avatar = null)
    {
        byte[]? avatarData = null;
        string? avatarUrl = null;
        string? avatarStorageKey = null;

        if (avatar != null)
        {
            if (_storageService.IsConfigured)
            {
                try
                {
                    avatarUrl = await _storageService.UploadFileAsync(avatar, "avatars", cancellationToken);
                    avatarStorageKey = _storageService.ExtractKey(avatarUrl);
                }
                catch
                {
                    avatarData = await UploadImageAsync(avatar);
                }
            }
            else
            {
                avatarData = await UploadImageAsync(avatar);
            }
        }
        var clubMember = new ClubMember
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name,
            Surname = dto.Surname,
            PhoneNumber = dto.PhoneNumber,
            DateOfBirth = dto.DateOfBirth,
            AvatarData = avatarData,
            AvatarUrl = avatarUrl,
            AvatarStorageKey = avatarStorageKey
        };


        var result = await _userManager.CreateAsync(clubMember, dto.Password);
        
        if(!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Registration error: {errors}");
        }

        // Adding roles to the user after successful creation
        if (dto.SelectedRoles != null && dto.SelectedRoles.Any())
        {
            foreach (var roleName in dto.SelectedRoles)
            {
                // Creating new role, if it's not assigned
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
            await _userManager.AddToRolesAsync(clubMember, dto.SelectedRoles);
        }
        //else // In case admin didn't choose role, we can assign `User` by default. To be discassed. For the moment commented to have opportunity to `block` User if necessary (no roles, only `Guest` acccess)
        //{
        //    await _userManager.AddToRoleAsync(clubMember, "User"); // Assigning default role if no roles are selected
        //}

        var roles = await _userManager.GetRolesAsync(clubMember);
        await SafeLogAsync(
            ActionLogCodes.Actions.Created,
            ActionLogCodes.Modules.Users,
            $"Створено користувача {clubMember.Email}, Id={clubMember.Id}",
            ActionLogCodes.Levels.Success,
            cancellationToken);
        return ClubMemberMapper.MapToReadDto(clubMember, roles);
    }

    public async Task<bool> UpdateAsync(string id, UpdateClubMemberDto dto, CancellationToken cancellationToken = default, IFormFile? avatar = null)
    {
        //byte[] avatarData = null;
       
        var clubMember = await _userManager.FindByIdAsync(id);
        if (clubMember is null)
        {
            return false;
        }
        clubMember.Name = dto.Name;
        clubMember.Surname = dto.Surname;
        clubMember.PhoneNumber = dto.PhoneNumber;
        clubMember.DateOfBirth = dto.DateOfBirth;
		if (avatar != null)
		{
			if (_storageService.IsConfigured)
			{
				try
				{
					var oldKey = clubMember.AvatarStorageKey ?? clubMember.AvatarUrl;
					if (!string.IsNullOrWhiteSpace(oldKey))
					{
						await _storageService.DeleteAsync(oldKey, cancellationToken);
					}
					clubMember.AvatarUrl = await _storageService.UploadFileAsync(avatar, "avatars", cancellationToken);
					clubMember.AvatarStorageKey = _storageService.ExtractKey(clubMember.AvatarUrl);
					clubMember.AvatarData = null;
				}
				catch
				{
					clubMember.AvatarData = await UploadImageAsync(avatar);
				}
			}
			else
			{
				clubMember.AvatarData = await UploadImageAsync(avatar);
			}
		}

		cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the update operation

        var result = await _userManager.UpdateAsync(clubMember);
        if (!result.Succeeded) return false;

        return true;
    }

    private async Task<byte[]?> UploadImageAsync(IFormFile avatar)
    {
        using var memoryStream = new MemoryStream();
        await avatar.CopyToAsync(memoryStream);
        byte[] avatarData = memoryStream.ToArray();
            
        return avatarData;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var clubMember = await _userManager.FindByIdAsync(id);
        if (clubMember is null)
        {
            return false;
        }

        var avatarKey = clubMember.AvatarStorageKey ?? clubMember.AvatarUrl;
        if (!string.IsNullOrWhiteSpace(avatarKey))
        {
            await _storageService.DeleteAsync(avatarKey, cancellationToken);
        }

        var email = clubMember.Email;

        var relatedNotifications = await _context.Notifications
       .Where(n => n.ClubMemberId == id || n.SenderId == id)
       .ToListAsync(cancellationToken);

        _context.Notifications.RemoveRange(relatedNotifications);
        await _context.SaveChangesAsync(cancellationToken);

        await _userManager.DeleteAsync(clubMember);

        await SafeLogAsync(
            ActionLogCodes.Actions.Deleted,
            ActionLogCodes.Modules.Users,
            $"Видалено користувача {email}, Id={id}",
            ActionLogCodes.Levels.Warning,
            cancellationToken);

        return true;
    }

    public async Task<ClubMemberReadDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested(); // Checking for cancellation before starting the operation
        
        var clubMember = await _userManager.FindByEmailAsync(email);
        if (clubMember == null) return null;

        var roles = await _userManager.GetRolesAsync(clubMember);
        return clubMember is null ? null : ClubMemberMapper.MapToReadDto(clubMember, roles);
    }

    // Method is searching for clubMembers with the specified phone number and returns a list of matching members.
    public async Task<List<ClubMemberReadDto>> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var members = await _userManager.Users
            .Where(m => m.PhoneNumber == phoneNumber)
            .ToListAsync(cancellationToken);

        var dtos = new List<ClubMemberReadDto>();
        foreach (var member in members)
        {
            var roles = await _userManager.GetRolesAsync(member);
            dtos.Add(ClubMemberMapper.MapToReadDto(member, roles));
        }
        return dtos;
    }
    public async Task<bool> UpdateFavoriteCategoriesAsync(string id, List<int> categoryIds, CancellationToken cancellationToken = default)
    {
        var clubMember = await _userManager.Users
            .Include(m => m.FavoriteCategories)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (clubMember is null) return false;

        var selected = await _context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        clubMember.FavoriteCategories.Clear();
        foreach (var cat in selected)
            clubMember.FavoriteCategories.Add(cat);

        var result = await _userManager.UpdateAsync(clubMember);
        return result.Succeeded;
    }
    public async Task<bool> ChangePasswordAsync(string id, ChangePasswordClubMemberDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return false;

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        return result.Succeeded;
    }

    public async Task<bool> LockUserAsync(string id, LockUserDto dto, string? lockedByUserId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        await _userManager.SetLockoutEnabledAsync(user, true);

        // Identity вимагає конкретну дату,
        // для постійного бану ставимо далеко в майбутнє
        var lockoutEnd = dto.LockoutEnd ?? DateTimeOffset.UtcNow.AddYears(100);
        await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);

        user.BlockReasonId = dto.BlockReasonId;
        user.LockoutComment = dto.Comment;
        user.LockedAt = DateTimeOffset.UtcNow;
        user.LockedById = lockedByUserId;

        await _userManager.UpdateAsync(user);
        await _userManager.UpdateSecurityStampAsync(user);

        await SafeLogAsync(
            ActionLogCodes.Actions.Blocked,
            ActionLogCodes.Modules.Users,
            $"Заблоковано користувача {user.Email}, Id={id}",
            ActionLogCodes.Levels.Warning,
            cancellationToken);

        return true;
    }
    public async Task<bool> UnlockUserAsync(string id, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        // знімаємо блок
        await _userManager.SetLockoutEndDateAsync(user, null);

        // очищаємо лічильник спроб
        await _userManager.ResetAccessFailedCountAsync(user);

        // очищаємо інформацію про причину/автора блокування
        user.BlockReasonId = null;
        user.LockoutComment = null;
        user.LockedAt = null;
        user.LockedById = null;

        await _userManager.UpdateAsync(user);

        await SafeLogAsync(
            ActionLogCodes.Actions.Unblocked,
            ActionLogCodes.Modules.Users,
            $"Розблоковано користувача {user.Email}, Id={id}",
            ActionLogCodes.Levels.Success,
            cancellationToken);

        return true;
    }

    private async Task SafeLogAsync(
        string action,
        string module,
        string details,
        string level,
        CancellationToken cancellationToken)
    {
        try
        {
            await _actionLog.LogAsync(action, module, details, level, cancellationToken: cancellationToken);
        }
        catch
        {
        }
    }

    // We always return ReadMapToReadDto to ensure consistent output format
    private async Task<List<ClubMemberReadDto>> MapToReadDtosAsync(List<ClubMember> clubMembers)
    {
        var list = new List<ClubMemberReadDto>();

        foreach (var member in clubMembers)
        {
            var roles = await _userManager.GetRolesAsync(member);
            list.Add(ClubMemberMapper.MapToReadDto(member, roles));
        }

        return list;
    }

}

