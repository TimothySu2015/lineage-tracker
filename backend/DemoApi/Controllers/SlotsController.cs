using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using DemoApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages equipment slots (部位).</summary>
[ApiController]
[Route("api/[controller]")]
public class SlotsController(AppDbContext db, IEquipmentStateService equipmentState) : ControllerBase
{
    /// <summary>Gets all slots with their current equipment state.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SlotResponse>>> GetAll()
    {
        var slots = await db.Slots.OrderBy(s => s.DisplayOrder).ToListAsync();
        var states = await equipmentState.GetAllCurrentStatesAsync();
        return slots.Select(s =>
        {
            states.TryGetValue(s.Id, out var item);
            return new SlotResponse(s.Id, s.Name, s.EnglishName, s.DisplayOrder, s.SafeValue, s.IsBuiltIn, item);
        }).ToList();
    }

    /// <summary>Creates a new custom slot.</summary>
    [HttpPost]
    public async Task<ActionResult<SlotResponse>> Create([FromBody] CreateSlotRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Name is required");
        var maxOrder = await db.Slots.MaxAsync(s => (int?)s.DisplayOrder) ?? 0;
        var slot = new Slot
        {
            Name = req.Name,
            EnglishName = req.EnglishName,
            SafeValue = req.SafeValue,
            DisplayOrder = req.DisplayOrder ?? maxOrder + 1,
            IsBuiltIn = false
        };
        db.Slots.Add(slot);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new SlotResponse(slot.Id, slot.Name, slot.EnglishName, slot.DisplayOrder, slot.SafeValue, slot.IsBuiltIn, null));
    }

    /// <summary>Updates a slot's metadata.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<SlotResponse>> Update(int id, [FromBody] UpdateSlotRequest req)
    {
        var slot = await db.Slots.FindAsync(id);
        if (slot is null) return NotFound();
        if (req.Name is not null) slot.Name = req.Name;
        if (req.EnglishName is not null) slot.EnglishName = req.EnglishName;
        if (req.SafeValue is not null) slot.SafeValue = req.SafeValue.Value;
        await db.SaveChangesAsync();
        var item = await equipmentState.GetCurrentStateAsync(id);
        return new SlotResponse(slot.Id, slot.Name, slot.EnglishName, slot.DisplayOrder, slot.SafeValue, slot.IsBuiltIn, item);
    }

    /// <summary>Deletes a custom (non-built-in) slot.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var slot = await db.Slots.FindAsync(id);
        if (slot is null) return NotFound();
        if (slot.IsBuiltIn) return BadRequest("Cannot delete built-in slots");
        db.Slots.Remove(slot);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
