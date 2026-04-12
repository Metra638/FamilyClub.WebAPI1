using FamilyClubLibrary;

namespace FamilyClub.DAL.Interfaces;

public interface IAuthorRepository : IRepository<Author>;
public interface ICategoryRepository : IRepository<Category>;
public interface ILanguageRepository : IRepository<Language>;
public interface IOrderItemRepository : IRepository<OrderItem>;
public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetAllWithImagesAsync(CancellationToken cancellationToken = default);
    Task<Product?> GetByIdWithImagesAsync(int id, CancellationToken cancellationToken = default);
}
public interface IPromotionRepository : IRepository<Promotion>;
public interface IPublisherRepository : IRepository<Publisher>;
public interface IReviewRepository : IRepository<Review>;
public interface ISeriesRepository : IRepository<Series>;
public interface ITranslatorRepository : IRepository<Translator>;
public interface IClubMemberRepository : IRepository<ClubMember>;
public interface IOrderRepository : IRepository<Order>
{
	Task<IEnumerable<Order>> GetAllWithItemsAsync(CancellationToken cancellationToken = default);
	Task<Order?> GetByIdWithItemsAsync(int id, CancellationToken cancellationToken = default);
};