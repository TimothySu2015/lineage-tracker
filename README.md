# 天堂經典記帳系統 (Lineage Tracker)

A monorepo demo showcasing AI-assisted full-stack development with Claude Code GitHub Actions.

## Structure
- `backend/DemoApi/` — .NET 10 Web API + EF Core + SQLite
- `frontend/` — React 18 + Vite + TypeScript + Tailwind CSS

## Local development

### Backend
```bash
cd backend/DemoApi
dotnet run
```
API runs on https://localhost:7xxx (check launchSettings.json)
Swagger UI: http://localhost:5000/swagger

### Frontend
```bash
cd frontend
npm run dev
```
Dev server runs on http://localhost:5173

## How Claude Code is used
This repo uses Claude Code GitHub Actions. Mention `@claude` in any issue
or PR comment to delegate implementation to AI.

## Modules
1. **Equipment Tracking** — slot-based equipment with buy/enhance/sell/fail transactions
2. **Consumable Ledger** — daily spending on potions, scrolls, etc.
3. **Cash Shop Purchases** — TWD-only premium purchases like monthly cards, bundles
