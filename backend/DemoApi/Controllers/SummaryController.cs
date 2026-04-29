using DemoApi.Data;
using DemoApi.Models;
using DemoApi.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Controllers;

/// <summary>Manages the global financial summary record.</summary>
[ApiController]
[Route("api/[controller]")]
public class SummaryController(AppDbContext db) : ControllerBase
{
    /// <summary>Gets the global summary.</summary>
    [HttpGet]
    public async Task<ActionResult<SummaryResponse>> Get()
    {
        var s = await db.Summaries.FindAsync(1);
        if (s is null) return NotFound();
        return new SummaryResponse(s.Id, s.UpdateDate, s.TotalDefense, s.TotalDeposit, s.Balance);
    }

    /// <summary>Updates the global summary.</summary>
    [HttpPut]
    public async Task<ActionResult<SummaryResponse>> Update([FromBody] UpdateSummaryRequest req)
    {
        if (req.TotalDeposit < 0) return BadRequest("TotalDeposit must be >= 0");
        var s = await db.Summaries.FindAsync(1);
        if (s is null) return NotFound();
        s.TotalDefense = req.TotalDefense;
        s.TotalDeposit = req.TotalDeposit;
        s.Balance = req.Balance;
        s.UpdateDate = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return new SummaryResponse(s.Id, s.UpdateDate, s.TotalDefense, s.TotalDeposit, s.Balance);
    }
}
