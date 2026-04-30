using DemoApi.Models.Enums;

namespace DemoApi.Models.Dtos;

/// <summary>Transaction response DTO.</summary>
public record TransactionResponse(
    int Id, int SlotId, TransactionType Type, string ItemDescription,
    PaymentCurrency PaymentCurrency, long PaymentAmount, int ExchangeRate,
    bool? Disappeared, string? Note, DateTime OccurredAt, DateTime CreatedAt);

/// <summary>Create transaction request DTO.</summary>
public record CreateTransactionRequest(
    TransactionType Type, string ItemDescription,
    PaymentCurrency PaymentCurrency, long PaymentAmount, int ExchangeRate,
    bool? Disappeared, string? Note, DateTime OccurredAt);

/// <summary>Update transaction request DTO.</summary>
public record UpdateTransactionRequest(
    TransactionType? Type, string? ItemDescription,
    PaymentCurrency? PaymentCurrency, long? PaymentAmount, int? ExchangeRate,
    bool? Disappeared, string? Note, DateTime? OccurredAt);
