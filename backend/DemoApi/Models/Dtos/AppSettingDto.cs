namespace DemoApi.Models.Dtos;

/// <summary>App setting response DTO.</summary>
public record AppSettingResponse(int Id, int DefaultExchangeRate);

/// <summary>App setting update request DTO.</summary>
public record UpdateAppSettingRequest(int DefaultExchangeRate);
