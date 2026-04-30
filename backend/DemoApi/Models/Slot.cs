namespace DemoApi.Models;

/// <summary>A permanent equipment slot container (部位).</summary>
public class Slot
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EnglishName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public int SafeValue { get; set; }
    public bool IsBuiltIn { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<Preset> Presets { get; set; } = [];
}
