namespace DemoApi.Models.Dtos;

/// <summary>Summary response DTO.</summary>
public record SummaryResponse(int Id, DateTime UpdateDate, int TotalDefense, int TotalDeposit, int Balance);

/// <summary>Summary update request DTO.</summary>
public record UpdateSummaryRequest(int TotalDefense, int TotalDeposit, int Balance);
