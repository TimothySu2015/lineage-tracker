namespace DemoApi.Models.Dtos;

/// <summary>Preset response DTO.</summary>
public record PresetResponse(int Id, int SlotId, string ItemName);

/// <summary>Create preset request DTO.</summary>
public record CreatePresetRequest(int SlotId, string ItemName);
