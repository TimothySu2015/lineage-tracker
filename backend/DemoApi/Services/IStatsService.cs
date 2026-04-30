using DemoApi.Models.Dtos;

namespace DemoApi.Services;

/// <summary>Computes statistics for all three financial modules.</summary>
public interface IStatsService
{
    /// <summary>Returns complete statistics for equipment, consumable, and shop modules.</summary>
    Task<StatsResponse> GetStatsAsync();
}
