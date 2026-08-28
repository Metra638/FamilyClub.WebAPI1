using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using FamilyClub.DAL.EF;
using FamilyClub.DAL.EF.DB;
using FamilyClub.DAL.Interfaces;
using FamilyClub.DAL.Repositories;
using FamilyClubLibrary;
using FamilyClub.WebAPI.Middlewares;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Allowing our requests from React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React URL
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
        npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    });
    options.UseSnakeCaseNamingConvention(); // Line to use automatic snake_case naming convention for PostgreSQL
});

// Identity
builder.Services.AddIdentity<ClubMember, IdentityRole>(options =>
{
    // Align with registration UI (min 6 chars). Special characters optional for better UX.
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
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
// Authentification (Login, Register, Logout)
builder.Services.AddScoped<IAuthClubMemberService, AuthClubMemberService>();
// RoleClubMember
builder.Services.AddScoped<IRoleClubMemberService, RoleClubMemberService>();
// ClaimsClubMember
builder.Services.AddScoped<IClaimsClubMemberService, ClaimsClubMemberService>();

builder.Services.Configure<FamilyClub.BLL.Options.SmtpOptions>(
    builder.Configuration.GetSection(FamilyClub.BLL.Options.SmtpOptions.SectionName));
builder.Services.Configure<FamilyClub.BLL.Options.AzureCommunicationServicesOptions>(
    builder.Configuration.GetSection(FamilyClub.BLL.Options.AzureCommunicationServicesOptions.SectionName));

var azureEmailOptions = builder.Configuration
    .GetSection(FamilyClub.BLL.Options.AzureCommunicationServicesOptions.SectionName)
    .Get<FamilyClub.BLL.Options.AzureCommunicationServicesOptions>();

if (!string.IsNullOrWhiteSpace(azureEmailOptions?.ConnectionString))
{
    builder.Services.AddScoped<IEmailSender, FamilyClub.WebAPI.Services.AzureEmailSender>();
}
else
{
    builder.Services.AddScoped<IEmailSender, FamilyClub.WebAPI.Services.SmtpEmailSender>();
}

//Review
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();
//Product
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

//Notification
builder.Services.AddScoped<INotificationRepository,  NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

//Format
builder.Services.AddScoped<IFormatRepository, FormatRepository>();
builder.Services.AddScoped<IFormatService, FormatService>();

//BookSize
builder.Services.AddScoped<IBookSizeRepository, BookSizeRepository>();
builder.Services.AddScoped<IBookSizeService, BookSizeService>();

//AgeRestiction
builder.Services.AddScoped<IAgeRestrictionRepository, AgeRestrictionRepository>();
builder.Services.AddScoped<IAgeRestrictionService, AgeRestrictionService>();

//Cart
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
builder.Services.AddScoped<ICartService, CartService>();

// Complaints
builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();
builder.Services.AddScoped<IComplaintsService, ComplaintService>();

builder.Services.AddScoped<IFavoriteService, FavoriteService>();
builder.Services.AddSingleton<IPresenceService, PresenceService>();

//BlockReason
builder.Services.AddScoped<IBlockReasonRepository, BlockReasonRepository>();
builder.Services.AddScoped<IBlockReasonService, BlockReasonService>();

// Blocked IPs
builder.Services.AddScoped<IBlockedIpRepository, BlockedIpRepository>();
builder.Services.AddScoped<IBlockedIpService, BlockedIpService>();

// Platform settings
builder.Services.AddScoped<IPlatformSettingsRepository, PlatformSettingsRepository>();
builder.Services.AddScoped<IPlatformSettingsService, PlatformSettingsService>();

// Action log (журнал дій)
builder.Services.AddScoped<IActionLogRepository, ActionLogRepository>();
builder.Services.AddScoped<IActionLogService, ActionLogService>();
builder.Services.AddHostedService<FamilyClub.WebAPI.BackgroundServices.ActionLogRetentionHostedService>();

// Customize Identity cookie
//builder.Services.ConfigureApplicationCookie(
//    options => {
//        options.LoginPath = "/Account/Login";
//        options.AccessDeniedPath = "/Account/AccessDenied";
//    });

builder.Services.ConfigureExternalCookie(options =>
{
    options.Cookie.Name = "FamilyClub.External";
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// JWT authentification
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException("JWT Secret Key is not configured.");
var key = Encoding.ASCII.GetBytes(secretKey);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddGoogle(options =>
    {
        var clientId = builder.Configuration["Authentication:Google:ClientId"]
            ?? builder.Configuration["Authentication:Google:ClientID"]
            ?? builder.Configuration["Google:ClientId"]
            ?? builder.Configuration["Google:ClientID"]
            ?? builder.Configuration["ClientId"]
            ?? builder.Configuration["ClientID"];

        var clientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
            ?? builder.Configuration["Authentication:Google:ClientSecret"]
            ?? builder.Configuration["Google:ClientSecret"]
            ?? builder.Configuration["ClientSecret"];

        options.ClientId = !string.IsNullOrWhiteSpace(clientId) ? clientId : "dummy-google-client-id";
        options.ClientSecret = !string.IsNullOrWhiteSpace(clientSecret) ? clientSecret : "dummy-google-client-secret";
        options.SignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            // JWT stores roles as short claim type "role"; needed for [Authorize(Roles)]
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name,
        };
        // Keep inbound mapping so "role" → ClaimTypes.Role for Authorize(Roles = "...")
        options.MapInboundClaims = true;
    });



// Adding AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    // Here will be added `Profiles` like on example below:
    //cfg.AddProfile(new ProductProfile());
}
);

//builder.Services.AddSwaggerGen(options =>
//{
//    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
//});
builder.Services.AddSwaggerGen();

builder.Services.AddMemoryCache();
builder.Services.AddResponseCaching();
builder.Services.AddOutputCache();
builder.Services.AddHealthChecks();

var redisConnStr = builder.Configuration["CacheSettings:RedisConnectionString"]
    ?? builder.Configuration.GetConnectionString("Redis")
    ?? "localhost:6379,abortConnect=false,connectTimeout=1000";

try
{
    var multiplexer = StackExchange.Redis.ConnectionMultiplexer.Connect(redisConnStr);
    builder.Services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(multiplexer);
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnStr;
        options.InstanceName = builder.Configuration["CacheSettings:InstanceName"] ?? "FamilyClubCache_";
    });
}
catch
{
    // Робастний фолбек до вбудованого пам'ятного кешу, якщо сервер Redis тимчасово недоступний
    builder.Services.AddDistributedMemoryCache();
}

builder.Services.AddSingleton<ICacheService, RedisCacheService>();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("GlobalLimit", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();


using (IServiceScope scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	await DbInitializer.Initialize(services, app.Configuration);
}

app.UseMiddleware<GlobalExceptionMiddleware>(); // Catch client cancellation & internal errors
app.UseForwardedHeaders(); // Must be early in pipeline to resolve real IP
// Liveness for K8s/Docker — before HTTPS redirect, rate limit, and IP block
app.UseHealthChecks("/health");
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

app.UseRateLimiter(); // Apply Rate Limiter before Auth and Controllers
app.UseMiddleware<IpBlockingMiddleware>(); // Block bad IPs before Auth

app.UseResponseCaching();
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Home}/{action=Index}/{id?}");
//1

app.Run();