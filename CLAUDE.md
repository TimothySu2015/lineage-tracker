# Project Instructions for Claude

## Repository Structure

This is a monorepo with:
- `backend/DemoApi/` — .NET 10 Web API (C# 14, controllers-based)
- `frontend/` — React 18 + Vite + TypeScript + Tailwind CSS
- `.github/workflows/` — CI / Claude Code Actions

## Coding Standards

### Backend (.NET 10 / C# 14)
- Target framework: `net10.0`
- Follow Microsoft C# coding conventions
- Use file-scoped namespaces (C# 10+)
- Use primary constructors where appropriate (C# 12+)
- Use collection expressions `[..]` for initializers (C# 12+)
- Use async/await for all I/O operations
- Controllers should be thin; business logic goes in Services
- DTOs go in `Models/Dtos/`, domain models in `Models/`
- Always add XML doc comments on public APIs
- Use constructor dependency injection; register services in Program.cs
- Return `ActionResult<T>` from controller actions
- Use proper HTTP status codes (200, 201, 204, 400, 404)
- Prefer `record` types for DTOs (immutable by default)
- Enable nullable reference types (default in .NET 10)
- Use EF Core for data access; avoid raw SQL unless necessary
- Use ILogger for logging; no Console.WriteLine in production code

### Frontend (React / TypeScript)
- Functional components only, no class components
- Props interface named `<ComponentName>Props`
- Component file structure: imports → types → hooks → handlers → JSX
- API calls in `src/services/`, never directly in components
- Type all API responses; no `any`
- Component files PascalCase (`TodoList.tsx`)
- Use `useState` and `useEffect`; avoid premature state libraries
- Tailwind CSS classes for styling; avoid inline styles
- Format numbers with `Intl.NumberFormat("en-US")` + `Math.round`

### General
- One PR per feature
- PR description must reference the issue number
- Commit messages: imperative mood ("Add", not "Added")
- Test changes before opening PR (build must pass)

## How to verify changes
- Backend: `cd backend/DemoApi && dotnet build`
- Frontend: `cd frontend && npm run build && npm run lint`
- Both must pass before opening PR

## What NOT to do
- Don't commit `.env` files, secrets, or `*.db` files
- Don't modify `.github/workflows/` unless explicitly asked
- Don't introduce new top-level dependencies without justification in PR description
- Don't downgrade target framework from net10.0
- Don't write Console.WriteLine for debugging; use ILogger or remove before commit
- Don't use `any` in TypeScript

---

## Domain Context: 天堂經典記帳系統

This project is a financial tracker for the game "Lineage Classic" (天堂經典),
covering equipment investment, consumable spending, and cash shop purchases.

### Core philosophy
- The system is **slot-oriented**, not equipment-oriented.
- A "slot" (部位) is a permanent container; what's in it is derived from
  the latest transaction events.
- All three modules (equipment / consumable / shop) are **independent**.
  No automatic linkage between modules or with `TotalDeposit` / `Balance`.

### Three independent modules

| Module | Currency | Has rate | Identity |
|---|---|---|---|
| Equipment Transaction | Adena + TWD | Yes | Slot + time series |
| Consumable | Adena + TWD | Yes | Independent log |
| CashShopPurchase | TWD only | No | Independent log |

### Domain-specific terminology

| Term (中文) | English | Notes |
|---|---|---|
| 天幣 | Adena | Game currency, can exceed int range — use `long` |
| 台幣 | TWD | Real money, `int` is sufficient |
| 部位 | Slot | Permanent container |
| 裝備 | Equipment | Derived from transactions |
| 強化 | Enhance | Upgrade an item, e.g. +5 → +6 |
| 強化失敗 | Fail | Failed upgrade attempt |
| 安定值 | SafeValue | Threshold for "guaranteed safe" upgrades |

### Equipment transaction rules

Four transaction types:
- **Buy**: Acquire a new equipment for a slot. Replaces previous item.
- **Enhance**: Successful upgrade. Updates the equipment's enhancement level.
- **Sell**: Voluntarily sell current equipment. Slot becomes empty.
- **Fail**: Failed enhancement attempt.
  - `Disappeared = false`: Equipment retained, only enhancement fee lost.
  - `Disappeared = true`: Equipment destroyed, slot becomes empty,
    accumulated value also lost.

### Current state derivation

The current equipment of a slot is **derived**, never stored:
1. Read all transactions for the slot, sorted by `OccurredAt`.
2. If the latest transaction is a termination (Sell or Fail-disappeared),
   the slot is empty.
3. Otherwise, find the latest Buy transaction after the last termination,
   then apply all subsequent Enhance transactions to derive the current
   enhancement level.

### Cost model

Every equipment transaction records:
- **PaymentCurrency**: Whether the user paid in Adena or TWD (one currency only)
- **PaymentAmount**: The actual amount paid
- **ExchangeRate**: The market rate at that moment (1 TWD = X Adena)

For analytics, transactions can be converted between currencies:
```
if PaymentCurrency == TWD:
    twd = PaymentAmount
    adena = PaymentAmount * ExchangeRate
else:
    adena = PaymentAmount
    twd = PaymentAmount / ExchangeRate
```

### Critical: avoid double-counting in stats

When computing global `successCost` vs `failLoss`:
- A Fail with `Disappeared=true` means the previously-recorded Buy + Enhance
  costs for that lost equipment must be **subtracted from successCost** and
  **added to failLoss**, otherwise totals will double-count.
- See SPEC §6.4 and §6.5 for the exact algorithm.

### What to avoid in this domain

- Do not auto-deduct cash shop purchases from `Balance`. The user manages
  `Balance` manually.
- Do not auto-add cash shop purchases to `TotalDeposit`. They are separate.
- Do not link consumables to equipment costs. They are independent ledgers.
- Do not store the "current equipment" as a column. Always derive it.
- Do not let Fail with `Disappeared=null` pass validation.
