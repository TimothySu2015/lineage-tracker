using DemoApi.Models.Enums;

namespace DemoApi.Models.Dtos;

/// <summary>Consumable response DTO.</summary>
public record ConsumableResponse(
    int Id, string Name, ConsumableCategory Category, int Quantity,
    PaymentCurrency PaymentCurrency, long PaymentAmount, int ExchangeRate,
    string? Note, DateTime OccurredAt, DateTime CreatedAt);

/// <summary>Create consumable request DTO.</summary>
public record CreateConsumableRequest(
    string Name, ConsumableCategory Category, int Quantity,
    PaymentCurrency PaymentCurrency, long PaymentAmount, int ExchangeRate,
    string? Note, DateTime OccurredAt);

/// <summary>Update consumable request DTO.</summary>
public record UpdateConsumableRequest(
    string? Name, ConsumableCategory? Category, int? Quantity,
    PaymentCurrency? PaymentCurrency, long? PaymentAmount, int? ExchangeRate,
    string? Note, DateTime? OccurredAt);
