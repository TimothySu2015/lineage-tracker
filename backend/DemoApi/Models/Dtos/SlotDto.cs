namespace DemoApi.Models.Dtos;

/// <summary>Slot response DTO including derived current item.</summary>
public record SlotResponse(int Id, string Name, string EnglishName, int DisplayOrder, int SafeValue, bool IsBuiltIn, string? CurrentItem);

/// <summary>Create slot request DTO.</summary>
public record CreateSlotRequest(string Name, string EnglishName, int SafeValue, int? DisplayOrder);

/// <summary>Update slot request DTO.</summary>
public record UpdateSlotRequest(string? Name, string? EnglishName, int? SafeValue);
