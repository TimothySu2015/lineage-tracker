namespace DemoApi.Models.Dtos;

/// <summary>Complete statistics response for all three modules.</summary>
public record StatsResponse(EquipmentStats Equipment, ConsumableStats Consumable, ShopStats Shop);

/// <summary>Equipment module statistics.</summary>
public record EquipmentStats(
    decimal NetInvestmentTwd, long NetInvestmentAdena,
    decimal SuccessCostTwd, decimal FailLossTwd, decimal RecoveredTwd,
    IReadOnlyList<SlotBreakdown> SlotBreakdown);

/// <summary>Per-slot cost breakdown.</summary>
public record SlotBreakdown(
    int SlotId, string SlotName, string? CurrentItem,
    decimal NetCostTwd, long NetCostAdena, decimal Ratio, int TransactionCount);

/// <summary>Consumable module statistics.</summary>
public record ConsumableStats(decimal TotalTwd, ConsumableCategoryStats ByCategory);

/// <summary>Consumable spending by category.</summary>
public record ConsumableCategoryStats(decimal Hunting, decimal Convenience, decimal Cosmetic);

/// <summary>Cash shop module statistics.</summary>
public record ShopStats(int TotalTwd, ShopCategoryStats ByCategory);

/// <summary>Shop spending by category.</summary>
public record ShopCategoryStats(int Subscription, int Bundle, int Cosmetic, int Convenience);
