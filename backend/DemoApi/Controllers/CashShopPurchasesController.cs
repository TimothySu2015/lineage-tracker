using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using DemoApi.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages cash shop purchase records.</summary>
[ApiController]
[Route("api/shop-purchases")]
public class CashShopPurchasesController(AppDbContext db) : ControllerBase
{
    private static CashShopPurchaseResponse ToResponse(CashShopPurchase p) =>
        new(p.Id, p.ProductName, p.Category, p.Description, p.Amount, p.Note, p.OccurredAt, p.CreatedAt);

    /// <summary>Gets purchases with optional category and date filters.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CashShopPurchaseResponse>>> GetAll(
        [FromQuery] CashShopCategory? category,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = db.CashShopPurchases.AsQueryable();
        if (category.HasValue) query = query.Where(p => p.Category == category.Value);
        if (from.HasValue) query = query.Where(p => p.OccurredAt >= from.Value);
        if (to.HasValue) query = query.Where(p => p.OccurredAt <= to.Value);
        var items = await query.OrderByDescending(p => p.OccurredAt).ToListAsync();
        return items.Select(ToResponse).ToList();
    }

    /// <summary>Creates a cash shop purchase record.</summary>
    [HttpPost]
    public async Task<ActionResult<CashShopPurchaseResponse>> Create([FromBody] CreateCashShopPurchaseRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ProductName)) return BadRequest("ProductName is required");
        if (req.Amount < 0) return BadRequest("Amount must be >= 0");

        var p = new CashShopPurchase
        {
            ProductName = req.ProductName, Category = req.Category, Description = req.Description,
            Amount = req.Amount, Note = req.Note, OccurredAt = req.OccurredAt, CreatedAt = DateTime.UtcNow
        };
        db.CashShopPurchases.Add(p);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), ToResponse(p));
    }

    /// <summary>Updates a cash shop purchase record.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CashShopPurchaseResponse>> Update(int id, [FromBody] UpdateCashShopPurchaseRequest req)
    {
        var p = await db.CashShopPurchases.FindAsync(id);
        if (p is null) return NotFound();
        if (req.ProductName is not null) p.ProductName = req.ProductName;
        if (req.Category is not null) p.Category = req.Category.Value;
        if (req.Description is not null) p.Description = req.Description;
        if (req.Amount is not null) p.Amount = req.Amount.Value;
        if (req.Note is not null) p.Note = req.Note;
        if (req.OccurredAt is not null) p.OccurredAt = req.OccurredAt.Value;
        await db.SaveChangesAsync();
        return ToResponse(p);
    }

    /// <summary>Deletes a cash shop purchase record.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await db.CashShopPurchases.FindAsync(id);
        if (p is null) return NotFound();
        db.CashShopPurchases.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
