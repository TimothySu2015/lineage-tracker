using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using DemoApi.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages equipment transactions for slots.</summary>
[ApiController]
[Route("api")]
public class TransactionsController(AppDbContext db) : ControllerBase
{
    private static TransactionResponse ToResponse(Transaction t) =>
        new(t.Id, t.SlotId, t.Type, t.ItemDescription, t.PaymentCurrency,
            t.PaymentAmount, t.ExchangeRate, t.Disappeared, t.Note, t.OccurredAt, t.CreatedAt);

    /// <summary>Gets all transactions for a slot.</summary>
    [HttpGet("slots/{slotId}/transactions")]
    public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetForSlot(int slotId)
    {
        var txs = await db.Transactions
            .Where(t => t.SlotId == slotId)
            .OrderBy(t => t.OccurredAt)
            .ToListAsync();
        return txs.Select(ToResponse).ToList();
    }

    /// <summary>Creates a transaction for a slot.</summary>
    [HttpPost("slots/{slotId}/transactions")]
    public async Task<ActionResult<TransactionResponse>> Create(int slotId, [FromBody] CreateTransactionRequest req)
    {
        if (!await db.Slots.AnyAsync(s => s.Id == slotId)) return NotFound("Slot not found");
        if (string.IsNullOrWhiteSpace(req.ItemDescription)) return BadRequest("ItemDescription is required");
        if (req.PaymentAmount < 0) return BadRequest("PaymentAmount must be >= 0");
        if (req.ExchangeRate <= 0) return BadRequest("ExchangeRate must be > 0");
        if (req.Type == TransactionType.Fail && req.Disappeared is null)
            return BadRequest("Disappeared is required for Fail transactions");

        var tx = new Transaction
        {
            SlotId = slotId,
            Type = req.Type,
            ItemDescription = req.ItemDescription,
            PaymentCurrency = req.PaymentCurrency,
            PaymentAmount = req.PaymentAmount,
            ExchangeRate = req.ExchangeRate,
            Disappeared = req.Disappeared,
            Note = req.Note,
            OccurredAt = req.OccurredAt,
            CreatedAt = DateTime.UtcNow
        };
        db.Transactions.Add(tx);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForSlot), new { slotId }, ToResponse(tx));
    }

    /// <summary>Updates a transaction.</summary>
    [HttpPut("transactions/{id}")]
    public async Task<ActionResult<TransactionResponse>> Update(int id, [FromBody] UpdateTransactionRequest req)
    {
        var tx = await db.Transactions.FindAsync(id);
        if (tx is null) return NotFound();
        if (req.Type is not null) tx.Type = req.Type.Value;
        if (req.ItemDescription is not null) tx.ItemDescription = req.ItemDescription;
        if (req.PaymentCurrency is not null) tx.PaymentCurrency = req.PaymentCurrency.Value;
        if (req.PaymentAmount is not null) tx.PaymentAmount = req.PaymentAmount.Value;
        if (req.ExchangeRate is not null) tx.ExchangeRate = req.ExchangeRate.Value;
        if (req.Disappeared is not null) tx.Disappeared = req.Disappeared;
        if (req.Note is not null) tx.Note = req.Note;
        if (req.OccurredAt is not null) tx.OccurredAt = req.OccurredAt.Value;
        await db.SaveChangesAsync();
        return ToResponse(tx);
    }

    /// <summary>Deletes a transaction.</summary>
    [HttpDelete("transactions/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tx = await db.Transactions.FindAsync(id);
        if (tx is null) return NotFound();
        db.Transactions.Remove(tx);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
