using DemoApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DemoApi.Data;

/// <summary>Seeds initial data into the database if empty.</summary>
public static class SeedData
{
    /// <summary>Seeds all initial data if the database is empty.</summary>
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Slots.AnyAsync()) return;

        db.Summaries.Add(new Summary { Id = 1, UpdateDate = DateTime.UtcNow });
        db.AppSettings.Add(new AppSetting { Id = 1, DefaultExchangeRate = 10000 });

        var slots = new[]
        {
            new Slot { Name = "頭", EnglishName = "Helm", DisplayOrder = 1, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "項鍊", EnglishName = "Necklace", DisplayOrder = 2, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "內衣", EnglishName = "T-Shirt", DisplayOrder = 3, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "盔甲", EnglishName = "Armor", DisplayOrder = 4, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "斗篷", EnglishName = "Cloak", DisplayOrder = 5, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "手", EnglishName = "Gloves", DisplayOrder = 6, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "靴", EnglishName = "Boots", DisplayOrder = 7, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "盾牌", EnglishName = "Shield", DisplayOrder = 8, SafeValue = 4, IsBuiltIn = true },
            new Slot { Name = "腰帶", EnglishName = "Belt", DisplayOrder = 9, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "戒指 1", EnglishName = "Ring 1", DisplayOrder = 10, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "戒指 2", EnglishName = "Ring 2", DisplayOrder = 11, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "戒面/耳環", EnglishName = "Earring", DisplayOrder = 12, SafeValue = 0, IsBuiltIn = true },
            new Slot { Name = "武器", EnglishName = "Weapon", DisplayOrder = 13, SafeValue = 4, IsBuiltIn = true },
        };
        db.Slots.AddRange(slots);
        await db.SaveChangesAsync();

        // Add preset item names per slot
        var presets = new List<Preset>();
        var slotList = await db.Slots.OrderBy(s => s.DisplayOrder).ToListAsync();
        var slotMap = slotList.ToDictionary(s => s.EnglishName);

        AddPresets(presets, slotMap["Helm"], ["+0 法師頭", "+6 騎士頭", "+9 暗騎頭"]);
        AddPresets(presets, slotMap["Necklace"], ["+0 項鍊", "+4 魔法項鍊"]);
        AddPresets(presets, slotMap["T-Shirt"], ["+0 內衣", "+4 輕型內衣"]);
        AddPresets(presets, slotMap["Armor"], ["+0 鎖鏈甲", "+7 巨人板甲"]);
        AddPresets(presets, slotMap["Cloak"], ["+0 斗篷", "+4 精靈斗篷"]);
        AddPresets(presets, slotMap["Gloves"], ["+0 手套", "+4 精靈手套"]);
        AddPresets(presets, slotMap["Boots"], ["+0 靴子", "+4 精靈靴"]);
        AddPresets(presets, slotMap["Shield"], ["+0 盾牌", "+4 騎士盾"]);
        AddPresets(presets, slotMap["Belt"], ["+0 腰帶", "+4 力量腰帶"]);
        AddPresets(presets, slotMap["Ring 1"], ["+0 戒指", "+4 智慧戒指"]);
        AddPresets(presets, slotMap["Ring 2"], ["+0 戒指", "+4 力量戒指"]);
        AddPresets(presets, slotMap["Earring"], ["+0 耳環", "+4 魔法耳環"]);
        AddPresets(presets, slotMap["Weapon"], ["+0 巨劍", "+7 雙手劍", "+9 長劍"]);

        db.Presets.AddRange(presets);
        await db.SaveChangesAsync();
    }

    private static void AddPresets(List<Preset> presets, Slot slot, string[] names)
    {
        foreach (var name in names)
            presets.Add(new Preset { SlotId = slot.Id, ItemName = name });
    }
}
