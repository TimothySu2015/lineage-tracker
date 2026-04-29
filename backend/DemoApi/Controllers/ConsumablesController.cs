using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using DemoApi.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages consumable spending records.</summary>
[ApiController]
[Route("api/[controller]")]
public class ConsumablesController(AppDbContext db) : ControllerBase
{
    private static ConsumableResponse ToResponse(Consumable c) =>
        new(c.Id, c.Name, c.Category, c.Quantity, c.PaymentCurrency,
            c.PaymentAmount, c.ExchangeRate, c.Note, c.OccurredAt, c.CreatedAt);

    /// <summary>Gets consumables with optional category and date filters.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConsumableResponse>>> GetAll(
        [FromQuery] ConsumableCategory? category,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = db.Consumables.AsQueryable();
        if (category.HasValue) query = query.Where(c => c.Category == category.Value);
        if (from.HasValue) query = query.Where(c => c.OccurredAt >= from.Value);
        if (to.HasValue) query = query.Where(c => c.OccurredAt <= to.Value);
        var items = await query.OrderByDescending(c => c.OccurredAt).ToListAsync();
        return items.Select(ToResponse).ToList();
    }

    /// <summary>Creates a consumable record.</summary>
    [HttpPost]
    public async Task<ActionResult<ConsumableResponse>> Create([FromBody] CreateConsumableRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Name is required");
        if (req.Quantity < 1) return BadRequest("Quantity must be >= 1");
        if (req.PaymentAmount < 0) return BadRequest("PaymentAmount must be >= 0");
        if (req.ExchangeRate <= 0) return BadRequest("ExchangeRate must be > 0");

        var c = new Consumable
        {
            Name = req.Name, Category = req.Category, Quantity = req.Quantity,
            PaymentCurrency = req.PaymentCurrency, PaymentAmount = req.PaymentAmount,
            ExchangeRate = req.ExchangeRate, Note = req.Note,
            OccurredAt = req.OccurredAt, CreatedAt = DateTime.UtcNow
        };
        db.Consumables.Add(c);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), ToResponse(c));
    }

    /// <summary>Updates a consumable record.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ConsumableResponse>> Update(int id, [FromBody] UpdateConsumableRequest req)
    {
        var c = await db.Consumables.FindAsync(id);
        if (c is null) return NotFound();
        if (req.Name is not null) c.Name = req.Name;
        if (req.Category is not null) c.Category = req.Category.Value;
        if (req.Quantity is not null) c.Quantity = req.Quantity.Value;
        if (req.PaymentCurrency is not null) c.PaymentCurrency = req.PaymentCurrency.Value;
        if (req.PaymentAmount is not null) c.PaymentAmount = req.PaymentAmount.Value;
        if (req.ExchangeRate is not null) c.ExchangeRate = req.ExchangeRate.Value;
        if (req.Note is not null) c.Note = req.Note;
        if (req.OccurredAt is not null) c.OccurredAt = req.OccurredAt.Value;
        await db.SaveChangesAsync();
        return ToResponse(c);
    }

    /// <summary>Deletes a consumable record.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await db.Consumables.FindAsync(id);
        if (c is null) return NotFound();
        db.Consumables.Remove(c);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
