using DemoApi.Models;

namespace DemoApi.Services;

/// <summary>Derives current equipment state from transaction history.</summary>
public interface IEquipmentStateService
{
    /// <summary>Returns the current item description for a slot, or null if empty.</summary>
    Task<string?> GetCurrentStateAsync(int slotId);

    /// <summary>Returns current state for all slots as a dictionary.</summary>
    Task<Dictionary<int, string?>> GetAllCurrentStatesAsync();
}
