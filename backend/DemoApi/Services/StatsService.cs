using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using DemoApi.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Services;

/// <inheritdoc/>
public class StatsService(AppDbContext db, IEquipmentStateService equipmentState) : IStatsService
{
    /// <inheritdoc/>
    public async Task<StatsResponse> GetStatsAsync()
    {
        var equipmentStats = await ComputeEquipmentStatsAsync();
        var consumableStats = await ComputeConsumableStatsAsync();
        var shopStats = await ComputeShopStatsAsync();
        return new StatsResponse(equipmentStats, consumableStats, shopStats);
    }

    private static (decimal twd, long adena) TxValue(Transaction tx)
    {
        if (tx.PaymentCurrency == PaymentCurrency.TWD)
            return (tx.PaymentAmount, (long)(tx.PaymentAmount * tx.ExchangeRate));
        else
            return ((decimal)tx.PaymentAmount / tx.ExchangeRate, tx.PaymentAmount);
    }

    private static (decimal twd, long adena) TxValue(Consumable c)
    {
        if (c.PaymentCurrency == PaymentCurrency.TWD)
            return (c.PaymentAmount, (long)(c.PaymentAmount * c.ExchangeRate));
        else
            return ((decimal)c.PaymentAmount / c.ExchangeRate, c.PaymentAmount);
    }

    private static decimal AccumulatedValueAtFailure(List<Transaction> txs, int failIdx)
    {
        // Find last termination before failIdx
        int lastTermIdx = -1;
        for (int i = failIdx - 1; i >= 0; i--)
        {
            var t = txs[i];
            if (t.Type == TransactionType.Sell || (t.Type == TransactionType.Fail && t.Disappeared == true))
            {
                lastTermIdx = i;
                break;
            }
        }

        decimal total = 0;
        for (int i = lastTermIdx + 1; i < failIdx; i++)
        {
            var t = txs[i];
            if (t.Type == TransactionType.Buy || t.Type == TransactionType.Enhance ||
                (t.Type == TransactionType.Fail && t.Disappeared == false))
            {
                total += TxValue(t).twd;
            }
        }
        return total;
    }

    private async Task<EquipmentStats> ComputeEquipmentStatsAsync()
    {
        var slots = await db.Slots.ToListAsync();
        var allTxs = await db.Transactions.OrderBy(t => t.OccurredAt).ToListAsync();
        var currentStates = await equipmentState.GetAllCurrentStatesAsync();

        decimal successCost = 0, failLoss = 0, recovered = 0;
        var slotBreakdowns = new List<SlotBreakdown>();

        foreach (var slot in slots)
        {
            var slotTxs = allTxs.Where(t => t.SlotId == slot.Id).OrderBy(t => t.OccurredAt).ToList();

            decimal slotNetTwd = 0;
            long slotNetAdena = 0;

            for (int idx = 0; idx < slotTxs.Count; idx++)
            {
                var tx = slotTxs[idx];
                var (twd, adena) = TxValue(tx);

                switch (tx.Type)
                {
                    case TransactionType.Buy:
                    case TransactionType.Enhance:
                        successCost += twd;
                        slotNetTwd += twd;
                        slotNetAdena += adena;
                        break;
                    case TransactionType.Sell:
                        recovered += twd;
                        slotNetTwd -= twd;
                        slotNetAdena -= adena;
                        break;
                    case TransactionType.Fail:
                        failLoss += twd;
                        slotNetTwd += twd;
                        slotNetAdena += adena;
                        if (tx.Disappeared == true)
                        {
                            var lostValue = AccumulatedValueAtFailure(slotTxs, idx);
                            failLoss += lostValue;
                            successCost -= lostValue;
                        }
                        break;
                }
            }

            if (slotTxs.Count > 0)
            {
                currentStates.TryGetValue(slot.Id, out var currentItem);
                slotBreakdowns.Add(new SlotBreakdown(
                    slot.Id, slot.Name, currentItem,
                    slotNetTwd, slotNetAdena, 0, slotTxs.Count));
            }
        }

        // Compute ratios
        var totalNetTwd = slotBreakdowns.Where(s => s.NetCostTwd > 0).Sum(s => s.NetCostTwd);
        var breakdownWithRatio = slotBreakdowns
            .Where(s => s.NetCostTwd > 0)
            .OrderByDescending(s => s.NetCostTwd)
            .Select(s => s with { Ratio = totalNetTwd > 0 ? Math.Round(s.NetCostTwd / totalNetTwd, 4) : 0 })
            .ToList();

        var netInvestmentTwd = successCost + failLoss - recovered;
        var netInvestmentAdena = slotBreakdowns.Sum(s => s.NetCostAdena);

        return new EquipmentStats(
            netInvestmentTwd, netInvestmentAdena,
            successCost, failLoss, recovered,
            breakdownWithRatio.AsReadOnly());
    }

    private async Task<ConsumableStats> ComputeConsumableStatsAsync()
    {
        var consumables = await db.Consumables.ToListAsync();
        decimal totalTwd = 0;
        decimal hunting = 0, convenience = 0, cosmetic = 0;

        foreach (var c in consumables)
        {
            var (twd, _) = TxValue(c);
            totalTwd += twd;
            switch (c.Category)
            {
                case ConsumableCategory.Hunting: hunting += twd; break;
                case ConsumableCategory.Convenience: convenience += twd; break;
                case ConsumableCategory.Cosmetic: cosmetic += twd; break;
            }
        }

        return new ConsumableStats(totalTwd, new ConsumableCategoryStats(hunting, convenience, cosmetic));
    }

    private async Task<ShopStats> ComputeShopStatsAsync()
    {
        var purchases = await db.CashShopPurchases.ToListAsync();
        int total = purchases.Sum(p => p.Amount);
        int subscription = 0, bundle = 0, cosmetic = 0, conv = 0;

        foreach (var p in purchases)
        {
            switch (p.Category)
            {
                case CashShopCategory.Subscription: subscription += p.Amount; break;
                case CashShopCategory.Bundle: bundle += p.Amount; break;
                case CashShopCategory.Cosmetic: cosmetic += p.Amount; break;
                case CashShopCategory.Convenience: conv += p.Amount; break;
            }
        }

        return new ShopStats(total, new ShopCategoryStats(subscription, bundle, cosmetic, conv));
    }
}
