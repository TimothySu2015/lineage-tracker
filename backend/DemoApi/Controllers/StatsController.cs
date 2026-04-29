using DemoApi.Models.Dtos;
using DemoApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace DemoApi.Controllers;

/// <summary>Provides aggregated statistics across all three modules.</summary>
[ApiController]
[Route("api/[controller]")]
public class StatsController(IStatsService statsService) : ControllerBase
{
    /// <summary>Returns complete stats for equipment, consumable, and shop modules.</summary>
    [HttpGet]
    public async Task<ActionResult<StatsResponse>> Get()
        => await statsService.GetStatsAsync();
}
