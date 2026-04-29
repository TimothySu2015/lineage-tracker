using DemoApi.Models.Enums;

namespace DemoApi.Models;

/// <summary>A consumable spending record.</summary>
public class Consumable
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ConsumableCategory Category { get; set; }
    public int Quantity { get; set; }
    public PaymentCurrency PaymentCurrency { get; set; }
    public long PaymentAmount { get; set; }
    public int ExchangeRate { get; set; }
    public string? Note { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
