using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using FamilyClubLibrary;

namespace FamilyClub.DAL.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly FamilyClubContext Context;
    private readonly DbSet<T> DbSet;

    public Repository(FamilyClubContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FindAsync([id], cancellationToken);
    }

    public async Task<IEnumerable<ProductImage>> GetProductImagesByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        if (typeof(T) != typeof(Product))
            throw new InvalidOperationException("This method is only valid for Product entities.");
        var product = await Context.Products
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        return product?.ProductImages ?? Enumerable.Empty<ProductImage>();
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        DbSet.Update(entity);
    }

    public void Delete(T entity)
    {
        DbSet.Remove(entity);
    }

    public void DeleteRange(IEnumerable<T> entities)
    {
        DbSet.RemoveRange(entities);
    }
}