using FamilyClub.DAL.EF;
using FamilyClub.DAL.Interfaces;
using FamilyClub.DAL.Repositories;
using FamilyClub.DAL.EF.DB;
using FamilyClubLibrary;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Allowing our requests from React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // React URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});



// MVC + Views
// Add services to the container.
builder.Services.AddControllers();
//builder.Services.AddControllersWithViews();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();


// Connection string
//string connStr = builder.Configuration.GetConnectionString("FamilyClubContext")
//    ?? throw new InvalidOperationException("Connection string 'FamilyClubContext' not found!");

string connStr = builder.Configuration.GetConnectionString("FamilyClub_DB")
    ?? throw new InvalidOperationException("Connection string 'FamilyClub_DB' not found!");

// DB CONTEXT
builder.Services.AddDbContext<FamilyClubContext>(options => {
    options.UseNpgsql(connStr, npgsql =>
    {
        npgsql.MigrationsAssembly("FamilyClub.DAL");
        npgsql.UseAdminDatabase("defaultdb");

    });
    options.UseSnakeCaseNamingConvention(); // Line to use automatic snake_case naming convention for PostgreSQL
});

// Identity
builder.Services.AddIdentity<ClubMember, IdentityRole>()
    .AddEntityFrameworkStores<FamilyClubContext>()
    .AddDefaultTokenProviders();

// Publisher
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPublisherService, PublisherService>();

builder.Services.AddScoped<IAuthorService, AuthorService>();
// Language
builder.Services.AddScoped<ILanguageRepository, LanguageRepository>();
builder.Services.AddScoped<ILanguageService, LanguageService>();
// Translator
builder.Services.AddScoped<ITranslatorRepository, TranslatorRepository>();
builder.Services.AddScoped<ITranslatorService, TranslatorService>();
// Category
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService,  CategoryService>();
// Series
builder.Services.AddScoped<ISeriesRepository, SeriesRepository>();
builder.Services.AddScoped<ISeriesService, SeriesService>();
// Promotion
builder.Services.AddScoped<IPromotionRepository,  PromotionRepository>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
//Order
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
//OrderItem
builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
builder.Services.AddScoped<IOrderItemService, OrderItemService>();
// ClubMember
//builder.Services.AddScoped<IClubMemberRepository, ClubMemberRepository>();
builder.Services.AddScoped<IClubMemberService, ClubMemberService>();


//Review
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Customize Identity cookie
//builder.Services.ConfigureApplicationCookie(
//    options => {
//        options.LoginPath = "/Account/Login";
//        options.AccessDeniedPath = "/Account/AccessDenied";
//    });

// Adding AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    // Here will be added `Profiles` like on example below:
    //cfg.AddProfile(new ProductProfile());
}
);

builder.Services.AddSwaggerGen();


var app = builder.Build();


using (IServiceScope scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	await DbInitializer.Initialize(services, app.Configuration);
}

app.UseCors("AllowReact"); // Allowing to use React

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve static files from wwwroot


app.UseDefaultFiles(); // Serve default files like index.html

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Home}/{action=Index}/{id?}");
//1

app.Run();