using FamilyClubLibrary;

namespace FamilyClub.DAL.Interfaces;

public interface IAuthorRepository : IRepository<Author>;
public interface ICategoryRepository : IRepository<Category>;
public interface ILanguageRepository : IRepository<Language>;
public interface IOrderRepository : IRepository<Order>;
public interface IOrderItemRepository : IRepository<OrderItem>;
public interface IProductRepository : IRepository<Product>;
public interface IPromotionRepository : IRepository<Promotion>;
public interface IPublisherRepository : IRepository<Publisher>;
public interface IReviewRepository : IRepository<Review>;
public interface ISeriesRepository : IRepository<Series>;
public interface ITranslatorRepository : IRepository<Translator>;
public interface IClubMemberRepository : IRepository<ClubMember>;