# 從這裡開始 (START HERE)

歡迎！你解壓的這個 ZIP 是「天堂經典記帳系統」的專案啟動包。

## 📦 ZIP 內容物

| 檔案 | 用途 |
|---|---|
| `setup.ps1` | **一鍵啟動腳本**，會幫你建好整個專案 |
| `CLAUDE.md` | 專案規範 + 領域知識（給 Claude Code 看的） |
| `README.md` | repo 的 README |
| `.gitignore` | git 忽略清單 |
| `issue-body.md` | SPEC v1.3 完整規格（之後丟給 Claude 用的） |
| `START_HERE.md` | **就是你正在看的這份** |

## 🚀 怎麼用

### 第 1 步：把整個資料夾移到你想要的位置

例如 `D:\codes\poc\ta\` 或 `C:\dev\lineage-tracker\`。

### 第 2 步：開 PowerShell 並 cd 到該資料夾

```powershell
cd D:\codes\poc\ta
```

### 第 3 步：第一次跑 PowerShell 腳本可能要解除執行限制

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

（會問你 Y/N，按 Y 確認）

### 第 4 步：執行一鍵腳本

```powershell
.\setup.ps1
```

腳本會自動：
1. 檢查環境工具（node、dotnet、git、gh、claude）
2. 確認 GitHub CLI 已登入
3. 建立後端 .NET 10 Web API（`backend/DemoApi/`）
4. 建立前端 React + Vite + TypeScript（`frontend/`）+ npm install
5. git init + 第一次 commit
6. 建立 GitHub repo（名稱：`lineage-tracker`，public）並 push

整個過程約 3-5 分鐘（npm install 最久）。

### 第 5 步：跟著腳本最後的提示繼續

腳本跑完會印出「下一步」清單，依序執行：

1. 安裝 Claude Code（如果還沒裝）：
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. 登入並接 GitHub Action：
   ```powershell
   claude
   ```
   進入 Claude Code 後輸入：`/install-github-app`

3. 觸發 Claude 開始實作：
   ```powershell
   gh issue create --title "[Feature] 實作天堂經典記帳系統 v1.3" --body-file issue-body.md
   ```

4. 觀察執行：
   ```powershell
   gh run watch
   ```

## ⚠️ 預先檢查清單

跑 `setup.ps1` **之前**確認你已有：

- [ ] Windows 10/11
- [ ] PowerShell（推薦 PowerShell 7 + Windows Terminal）
- [ ] Node.js 20+ 已安裝（`node --version` 確認）
- [ ] .NET 10 SDK 已安裝（`dotnet --version` 應為 10.x）
- [ ] Git 已安裝且設定好身分（`git config --global user.name` / `user.email`）
- [ ] GitHub CLI 已登入（`gh auth status` 顯示已登入）
- [ ] Claude Max 5x 訂閱（用於 Claude Code）

如果有缺少，腳本會在環境檢查階段告訴你要裝什麼。

## 🛠️ 修改設定

打開 `setup.ps1` 最上面有兩個變數：

```powershell
$RepoName = "lineage-tracker"
$IsPublic = $true   # 改 $false 可以建 private repo
```

可以改成你想要的名字 / 改成 private。

## 🆘 出狀況怎麼辦

腳本任何階段失敗都會印紅字錯誤訊息。常見問題：

| 症狀 | 解法 |
|---|---|
| `dotnet 找不到` | `winget install Microsoft.DotNet.SDK.10`，重開 Terminal |
| `node 找不到` | `winget install OpenJS.NodeJS.LTS`，重開 Terminal |
| `git config user.name 沒設定` | `git config --global user.name "你的名字"` |
| `gh auth status` 失敗 | `gh auth login`，跟著互動選項走 |
| `gh repo create` 失敗（名稱已存在）| 編輯 setup.ps1 改 `$RepoName` 換個名字，或刪掉舊 repo |
| 執行 .ps1 被擋 | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |

## 📚 詳細說明

完整的 SPEC 在 `issue-body.md`，CLAUDE.md 是專案的編碼規範與領域知識。
