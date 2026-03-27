using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;

namespace FamilyClub.DAL.Repositories;

public class AuthorRepository(FamilyClubContext context) : Repository<Author>(context), IAuthorRepository;
public class CategoryRepository(FamilyClubContext context) : Repository<Category>(context), ICategoryRepository;
public class LanguageRepository(FamilyClubContext context) : Repository<Language>(context), ILanguageRepository;
public class OrderRepository(FamilyClubContext context) : Repository<Order>(context), IOrderRepository;
public class OrderItemRepository(FamilyClubContext context) : Repository<OrderItem>(context), IOrderItemRepository;
public class ProductRepository(FamilyClubContext context) : Repository<Product>(context), IProductRepository;
public class PromotionRepository(FamilyClubContext context) : Repository<Promotion>(context), IPromotionRepository;
public class PublisherRepository(FamilyClubContext context) : Repository<Publisher>(context), IPublisherRepository;
public class ReviewRepository(FamilyClubContext context) : Repository<Review>(context), IReviewRepository;
public class SeriesRepository(FamilyClubContext context) : Repository<Series>(context), ISeriesRepository;
public class TranslatorRepository(FamilyClubContext context) : Repository<Translator>(context), ITranslatorRepository;
public class ClubMemberRepository(FamilyClubContext context) : Repository<ClubMember>(context), IClubMemberRepository;