using DemoApi.Models.Enums;

namespace DemoApi.Models;

/// <summary>An equipment transaction event for a slot.</summary>
public class Transaction
{
    public int Id { get; set; }
    public int SlotId { get; set; }
    public Slot Slot { get; set; } = null!;
    public TransactionType Type { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public PaymentCurrency PaymentCurrency { get; set; }
    public long PaymentAmount { get; set; }
    public int ExchangeRate { get; set; }
    public bool? Disappeared { get; set; }
    public string? Note { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
