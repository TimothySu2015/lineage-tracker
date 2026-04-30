namespace DemoApi.Models;

/// <summary>Global financial summary. Always exactly one row with Id=1.</summary>
public class Summary
{
    public int Id { get; set; } = 1;
    public DateTime UpdateDate { get; set; }
    public int TotalDefense { get; set; }
    public int TotalDeposit { get; set; }
    public int Balance { get; set; }
}
