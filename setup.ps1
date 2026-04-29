# ============================================================
# 天堂經典記帳系統 - 一鍵建立專案腳本
# ============================================================
# 用法：
#   1. 把這個 ZIP 解壓到任一資料夾（例如 D:\codes\poc\ta）
#   2. 開 PowerShell，cd 到該資料夾
#   3. 執行：.\setup.ps1
#
# 第一次執行可能需要解除 PowerShell 執行限制：
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# ============================================================

$ErrorActionPreference = "Stop"
$RepoName = "lineage-tracker"
$IsPublic = $true   # 改 $false 可以建 private repo

# === Helper 函式 ===
function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-Ok   { param([string]$msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err  { param([string]$msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red }

function Test-Tool {
    param([string]$cmd, [string]$name, [string]$installHint)
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $version = & $cmd --version 2>&1 | Select-Object -First 1
        Write-Ok "$name 已安裝：$version"
        return $true
    } else {
        Write-Err "$name 找不到"
        Write-Host "         安裝指令：$installHint" -ForegroundColor Yellow
        return $false
    }
}

# ============================================================
# Phase 1: 環境檢查
# ============================================================
Write-Step "Phase 1: 檢查環境工具"

$allOk = $true
$allOk = (Test-Tool "node"   "Node.js"     "winget install OpenJS.NodeJS.LTS") -and $allOk
$allOk = (Test-Tool "npm"    "npm"         "(隨 Node.js 一起安裝)") -and $allOk
$allOk = (Test-Tool "dotnet" ".NET SDK"    "winget install Microsoft.DotNet.SDK.10") -and $allOk
$allOk = (Test-Tool "git"    "Git"         "winget install Git.Git") -and $allOk
$allOk = (Test-Tool "gh"     "GitHub CLI"  "winget install GitHub.cli") -and $allOk

if (-not $allOk) {
    Write-Err "`n環境工具不齊全，請先安裝缺少的工具，重新開啟 PowerShell 後再跑此腳本。"
    exit 1
}

# 檢查 .NET 版本
$dotnetVersion = & dotnet --version
if (-not $dotnetVersion.StartsWith("10.")) {
    Write-Warn ".NET 版本是 $dotnetVersion，但本專案需要 .NET 10。"
    Write-Warn "如果你有多版 SDK 共存，這沒關係（dotnet new 會用最新版）。"
    Write-Warn "如果這是唯一版本，請執行：winget install Microsoft.DotNet.SDK.10"
}

# 檢查 GitHub CLI 登入狀態
Write-Host "`n檢查 GitHub CLI 登入狀態..." -ForegroundColor Cyan
$ghStatus = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "GitHub CLI 尚未登入"
    Write-Host "         請執行：gh auth login" -ForegroundColor Yellow
    Write-Host "         選項：GitHub.com -> HTTPS -> Y -> Login with a web browser" -ForegroundColor Yellow
    exit 1
}
Write-Ok "GitHub CLI 已登入"

# 檢查 Claude Code（選用）
if (Get-Command "claude" -ErrorAction SilentlyContinue) {
    Write-Ok "Claude Code 已安裝"
} else {
    Write-Warn "Claude Code 尚未安裝。等專案建好後請執行：npm install -g @anthropic-ai/claude-code"
    Write-Warn "（不影響此腳本執行）"
}

# ============================================================
# Phase 2: 確認操作前的狀態
# ============================================================
Write-Step "Phase 2: 確認當前資料夾"

$cwd = Get-Location
Write-Host "  目前位置：$cwd"

# 檢查當前資料夾是否乾淨（除了 starter 檔案外不應有其他東西）
$existingItems = Get-ChildItem -Force | Where-Object {
    $_.Name -notin @(".gitignore", "CLAUDE.md", "README.md", "issue-body.md", "setup.ps1")
}

if ($existingItems.Count -gt 0) {
    Write-Warn "當前資料夾有非 starter 檔案："
    $existingItems | ForEach-Object { Write-Host "    - $($_.Name)" }
    $confirm = Read-Host "`n  繼續會把 backend/、frontend/ 等專案檔案建立在此處。是否繼續？(y/N)"
    if ($confirm -ne "y") {
        Write-Host "已取消" -ForegroundColor Yellow
        exit 0
    }
}

# 檢查 starter 檔案是否齊全
$requiredFiles = @("CLAUDE.md", "README.md", ".gitignore", "issue-body.md")
foreach ($f in $requiredFiles) {
    if (-not (Test-Path $f)) {
        Write-Err "缺少 starter 檔案：$f"
        Write-Err "請確認你已正確解壓 ZIP，且在解壓後的資料夾執行此腳本"
        exit 1
    }
}
Write-Ok "Starter 檔案齊全"

# ============================================================
# Phase 3: 建立後端專案
# ============================================================
Write-Step "Phase 3: 建立後端 .NET 10 Web API"

if (Test-Path "backend") {
    Write-Warn "backend/ 資料夾已存在，跳過建立"
} else {
    New-Item -ItemType Directory -Path "backend" | Out-Null
    Push-Location "backend"
    try {
        Write-Host "  執行：dotnet new webapi -n DemoApi --use-controllers"
        & dotnet new webapi -n DemoApi --use-controllers
        if ($LASTEXITCODE -ne 0) { throw "dotnet new webapi 失敗" }
        Write-Ok "後端建立完成"
    } finally {
        Pop-Location
    }
}

# ============================================================
# Phase 4: 建立前端專案
# ============================================================
Write-Step "Phase 4: 建立前端 React + Vite + TypeScript"

if (Test-Path "frontend") {
    Write-Warn "frontend/ 資料夾已存在，跳過建立"
} else {
    Write-Host "  執行：npm create vite@latest frontend -- --template react-ts"
    & npm create vite@latest frontend -- --template react-ts
    if ($LASTEXITCODE -ne 0) { throw "npm create vite 失敗" }

    Write-Host "  執行：npm install (這需要約 1-2 分鐘)"
    Push-Location "frontend"
    try {
        & npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install 失敗" }
        Write-Ok "前端建立完成"
    } finally {
        Pop-Location
    }
}

# ============================================================
# Phase 5: Git 初始化與第一次 commit
# ============================================================
Write-Step "Phase 5: Git 初始化"

if (Test-Path ".git") {
    Write-Warn ".git 已存在，跳過 git init"
} else {
    & git init | Out-Null
    Write-Ok "git init 完成"
}

# 確認 git 身分有設定
$gitName = & git config --global user.name
$gitEmail = & git config --global user.email
if ([string]::IsNullOrWhiteSpace($gitName) -or [string]::IsNullOrWhiteSpace($gitEmail)) {
    Write-Err "Git 身分未設定！請執行："
    Write-Host '       git config --global user.name "Your Name"' -ForegroundColor Yellow
    Write-Host '       git config --global user.email "your-email@example.com"' -ForegroundColor Yellow
    exit 1
}
Write-Ok "Git 身分：$gitName <$gitEmail>"

& git add . | Out-Null

# 檢查是否真的有東西要 commit
$status = & git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Warn "沒有新檔案需要 commit"
} else {
    & git commit -m "Initial commit: .NET 10 Web API + React + Vite + TypeScript + CLAUDE.md" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "第一次 commit 完成"
    } else {
        Write-Warn "可能已有 commit"
    }
}

# ============================================================
# Phase 6: 建立 GitHub Repo 並推送
# ============================================================
Write-Step "Phase 6: 建立 GitHub Repo 並推送"

# 檢查 remote 是否已存在
$existingRemote = & git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Warn "Remote 'origin' 已存在：$existingRemote"
    Write-Warn "跳過 gh repo create，直接 push"
    & git branch -M main 2>&1 | Out-Null
    & git push -u origin main
} else {
    $visibility = if ($IsPublic) { "--public" } else { "--private" }
    Write-Host "  執行：gh repo create $RepoName $visibility --source=. --remote=origin --push"
    & gh repo create $RepoName $visibility --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) {
        Write-Err "gh repo create 失敗。可能該名稱已存在？"
        Write-Host "       手動方式：" -ForegroundColor Yellow
        Write-Host "         gh repo create <你想要的名字> $visibility --source=. --remote=origin --push" -ForegroundColor Yellow
        exit 1
    }
    Write-Ok "Repo 建立並推送完成"
}

# ============================================================
# 完成提示
# ============================================================
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Phase 1-6 完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`n專案位置：$cwd" -ForegroundColor Cyan
Write-Host "GitHub repo："
& gh repo view --json url --jq .url

Write-Host "`n=== 下一步：接 Claude Code GitHub Action ===" -ForegroundColor Yellow
Write-Host "1. 確認已安裝 Claude Code："
Write-Host "     npm install -g @anthropic-ai/claude-code"
Write-Host ""
Write-Host "2. 在這個資料夾跑："
Write-Host "     claude"
Write-Host ""
Write-Host "3. 在 Claude Code 介面輸入："
Write-Host "     /install-github-app"
Write-Host ""
Write-Host "4. 按指示授權 GitHub App"
Write-Host ""
Write-Host "5. 完成後跑下面指令觸發 Claude 開始實作："
Write-Host "     gh issue create --title `"[Feature] 實作天堂經典記帳系統 v1.3`" --body-file issue-body.md"
Write-Host ""
Write-Host "6. 觀察執行：gh run watch  或  gh repo view --web"
Write-Host ""
Write-Host "===========================================" -ForegroundColor Yellow
