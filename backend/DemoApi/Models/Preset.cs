namespace DemoApi.Models;

/// <summary>A preset item name suggestion for a slot.</summary>
public class Preset
{
    public int Id { get; set; }
    public int SlotId { get; set; }
    public Slot Slot { get; set; } = null!;
    public string ItemName { get; set; } = string.Empty;
}
