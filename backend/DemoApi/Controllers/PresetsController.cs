using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages preset item name suggestions per slot.</summary>
[ApiController]
[Route("api/[controller]")]
public class PresetsController(AppDbContext db) : ControllerBase
{
    /// <summary>Gets all presets for a slot.</summary>
    [HttpGet("{slotId}")]
    public async Task<ActionResult<IEnumerable<PresetResponse>>> GetForSlot(int slotId)
    {
        var presets = await db.Presets
            .Where(p => p.SlotId == slotId)
            .Select(p => new PresetResponse(p.Id, p.SlotId, p.ItemName))
            .ToListAsync();
        return presets;
    }

    /// <summary>Creates a preset item name for a slot.</summary>
    [HttpPost]
    public async Task<ActionResult<PresetResponse>> Create([FromBody] CreatePresetRequest req)
    {
        if (!await db.Slots.AnyAsync(s => s.Id == req.SlotId)) return NotFound("Slot not found");
        if (string.IsNullOrWhiteSpace(req.ItemName)) return BadRequest("ItemName is required");
        var p = new Preset { SlotId = req.SlotId, ItemName = req.ItemName };
        db.Presets.Add(p);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForSlot), new { slotId = p.SlotId }, new PresetResponse(p.Id, p.SlotId, p.ItemName));
    }

    /// <summary>Deletes a preset.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await db.Presets.FindAsync(id);
        if (p is null) return NotFound();
        db.Presets.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
