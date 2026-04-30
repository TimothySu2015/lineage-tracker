using DemoApi.Models.Enums;

namespace DemoApi.Models;

/// <summary>A cash shop purchase record (TWD only).</summary>
public class CashShopPurchase
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public CashShopCategory Category { get; set; }
    public string? Description { get; set; }
    public int Amount { get; set; }
    public string? Note { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
