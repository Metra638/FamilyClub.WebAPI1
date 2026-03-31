using FamilyClub.DAL.EF;
using FamilyClub.DAL.EF.DB;
using FamilyClubLibrary;
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
string connStr = builder.Configuration.GetConnectionString("FamilyClubContext")
    ?? throw new InvalidOperationException("Connection string 'FamilyClubContext' not found!");

// DB CONTEXT
builder.Services.AddDbContext<FamilyClubContext>(options => {
    //options.UseSqlServer(connStr);
    options.UseNpgsql(connStr);
});

// Identity
builder.Services.AddIdentity<ClubMember, IdentityRole>()
    .AddEntityFrameworkStores<FamilyClubContext>()
    .AddDefaultTokenProviders();

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


app.Run();
