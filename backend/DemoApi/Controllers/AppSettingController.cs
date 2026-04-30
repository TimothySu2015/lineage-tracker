using DemoApi.Data;
using DemoApi.Models.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace DemoApi.Controllers;

/// <summary>Manages application-wide settings.</summary>
[ApiController]
[Route("api/settings")]
public class AppSettingController(AppDbContext db) : ControllerBase
{
    /// <summary>Gets the application settings.</summary>
    [HttpGet]
    public async Task<ActionResult<AppSettingResponse>> Get()
    {
        var s = await db.AppSettings.FindAsync(1);
        if (s is null) return NotFound();
        return new AppSettingResponse(s.Id, s.DefaultExchangeRate);
    }

    /// <summary>Updates the application settings.</summary>
    [HttpPut]
    public async Task<ActionResult<AppSettingResponse>> Update([FromBody] UpdateAppSettingRequest req)
    {
        if (req.DefaultExchangeRate <= 0) return BadRequest("DefaultExchangeRate must be > 0");
        var s = await db.AppSettings.FindAsync(1);
        if (s is null) return NotFound();
        s.DefaultExchangeRate = req.DefaultExchangeRate;
        await db.SaveChangesAsync();
        return new AppSettingResponse(s.Id, s.DefaultExchangeRate);
    }
}
