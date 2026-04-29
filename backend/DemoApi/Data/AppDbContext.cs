using DemoApi.Models;
using DemoApi.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Data;

/// <summary>Main application database context.</summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Summary> Summaries => Set<Summary>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Consumable> Consumables => Set<Consumable>();
    public DbSet<CashShopPurchase> CashShopPurchases => Set<CashShopPurchase>();
    public DbSet<Preset> Presets => Set<Preset>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Summary>().HasKey(s => s.Id);
        modelBuilder.Entity<AppSetting>().HasKey(a => a.Id);

        modelBuilder.Entity<Slot>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).HasMaxLength(50).IsRequired();
            e.Property(s => s.EnglishName).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.ItemDescription).HasMaxLength(100).IsRequired();
            e.Property(t => t.Note).HasMaxLength(200);
            e.Property(t => t.Type).HasConversion<string>();
            e.Property(t => t.PaymentCurrency).HasConversion<string>();
            e.HasOne(t => t.Slot).WithMany(s => s.Transactions).HasForeignKey(t => t.SlotId);
        });

        modelBuilder.Entity<Consumable>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
            e.Property(c => c.Note).HasMaxLength(200);
            e.Property(c => c.Category).HasConversion<string>();
            e.Property(c => c.PaymentCurrency).HasConversion<string>();
        });

        modelBuilder.Entity<CashShopPurchase>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.ProductName).HasMaxLength(100).IsRequired();
            e.Property(c => c.Description).HasMaxLength(500);
            e.Property(c => c.Note).HasMaxLength(200);
            e.Property(c => c.Category).HasConversion<string>();
        });

        modelBuilder.Entity<Preset>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.ItemName).IsRequired();
            e.HasOne(p => p.Slot).WithMany(s => s.Presets).HasForeignKey(p => p.SlotId);
        });
    }
}
