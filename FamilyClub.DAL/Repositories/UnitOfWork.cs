using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;

namespace FamilyClub.DAL.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly FamilyClubContext _context;

    public UnitOfWork(FamilyClubContext context)
    {
        _context = context;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}