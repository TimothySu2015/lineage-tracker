using DemoApi.Models.Enums;

namespace DemoApi.Models.Dtos;

/// <summary>Cash shop purchase response DTO.</summary>
public record CashShopPurchaseResponse(
    int Id, string ProductName, CashShopCategory Category, string? Description,
    int Amount, string? Note, DateTime OccurredAt, DateTime CreatedAt);

/// <summary>Create cash shop purchase request DTO.</summary>
public record CreateCashShopPurchaseRequest(
    string ProductName, CashShopCategory Category, string? Description,
    int Amount, string? Note, DateTime OccurredAt);

/// <summary>Update cash shop purchase request DTO.</summary>
public record UpdateCashShopPurchaseRequest(
    string? ProductName, CashShopCategory? Category, string? Description,
    int? Amount, string? Note, DateTime? OccurredAt);
