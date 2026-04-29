using System.Text.RegularExpressions;
using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Services;

/// <inheritdoc/>
public partial class EquipmentStateService(AppDbContext db) : IEquipmentStateService
{
    [GeneratedRegex(@"→\s*(\+\d+)")]
    private static partial Regex EnhanceRegex();

    /// <inheritdoc/>
    public async Task<string?> GetCurrentStateAsync(int slotId)
    {
        var txs = await db.Transactions
            .Where(t => t.SlotId == slotId)
            .OrderBy(t => t.OccurredAt)
            .ToListAsync();
        return DeriveState(txs);
    }

    /// <inheritdoc/>
    public async Task<Dictionary<int, string?>> GetAllCurrentStatesAsync()
    {
        var allTxs = await db.Transactions
            .OrderBy(t => t.OccurredAt)
            .ToListAsync();

        return allTxs
            .GroupBy(t => t.SlotId)
            .ToDictionary(g => g.Key, g => DeriveState([.. g]));
    }

    private static string? DeriveState(List<Transaction> txs)
    {
        if (txs.Count == 0) return null;

        // Find last termination event (Sell or Fail with Disappeared=true)
        int lastTermIdx = -1;
        for (int i = txs.Count - 1; i >= 0; i--)
        {
            var tx = txs[i];
            if (tx.Type == TransactionType.Sell || (tx.Type == TransactionType.Fail && tx.Disappeared == true))
            {
                lastTermIdx = i;
                break;
            }
        }

        // If last event is a termination → empty slot
        if (lastTermIdx == txs.Count - 1) return null;

        // Find latest Buy after last termination
        int buyIdx = -1;
        for (int i = txs.Count - 1; i > lastTermIdx; i--)
        {
            if (txs[i].Type == TransactionType.Buy)
            {
                buyIdx = i;
                break;
            }
        }

        if (buyIdx == -1) return null;

        var currentItem = txs[buyIdx].ItemDescription;

        // Apply subsequent Enhance transactions to update enhancement level
        for (int i = buyIdx + 1; i < txs.Count; i++)
        {
            if (txs[i].Type == TransactionType.Enhance)
            {
                var match = EnhanceRegex().Match(txs[i].ItemDescription);
                if (match.Success)
                {
                    // Replace the enhancement level in currentItem
                    currentItem = Regex.Replace(currentItem, @"\+\d+", match.Groups[1].Value);
                }
            }
        }

        return currentItem;
    }
}
