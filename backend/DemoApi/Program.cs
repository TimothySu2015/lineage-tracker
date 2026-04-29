using DemoApi.Data;
using DemoApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

builder.Services.AddOpenApi();

var dbPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "data", "equipment.db");
var dbDir = Path.GetDirectoryName(dbPath)!;
Directory.CreateDirectory(dbDir);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={Path.GetFullPath(dbPath)}"));

builder.Services.AddScoped<IEquipmentStateService, EquipmentStateService>();
builder.Services.AddScoped<IStatsService, StatsService>();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Auto-create and seed database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    await SeedData.SeedAsync(db);
}

app.MapOpenApi();

// Serve Swagger UI at /swagger using CDN
app.MapGet("/swagger", () => Results.Content("""
<!DOCTYPE html>
<html>
<head>
  <title>Swagger UI</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/openapi/v1.json', dom_id: '#swagger-ui', layout: 'BaseLayout' })
  </script>
</body>
</html>
""", "text/html"));

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
