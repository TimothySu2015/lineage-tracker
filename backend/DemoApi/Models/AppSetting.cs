namespace DemoApi.Models;

/// <summary>Application-wide settings. Always exactly one row with Id=1.</summary>
public class AppSetting
{
    public int Id { get; set; } = 1;
    public int DefaultExchangeRate { get; set; }
}
