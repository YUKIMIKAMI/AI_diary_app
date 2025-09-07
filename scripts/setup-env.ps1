# PowerShell script for secure .env setup
# このスクリプトはAPIキーを安全に入力するためのものです

Write-Host "AI Diary App - 環境変数セットアップ" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "APIキーを安全に入力します。入力中は画面に表示されません。" -ForegroundColor Yellow
Write-Host ""

# .envファイルのパス
$envPath = Join-Path $PSScriptRoot "..\.env"

# .env.exampleから.envを作成
if (Test-Path "$PSScriptRoot\..\.env.example") {
    Copy-Item "$PSScriptRoot\..\.env.example" $envPath -Force
    Write-Host ".envファイルを作成しました" -ForegroundColor Green
} else {
    Write-Host ".env.exampleが見つかりません" -ForegroundColor Red
    exit 1
}

# 関数: 安全にパスワード入力
function Read-SecureInput($prompt) {
    $secure = Read-Host -AsSecureString $prompt
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    return $plain
}

Write-Host "各種APIキーを入力してください（スキップする場合はEnterキーを押してください）" -ForegroundColor Cyan
Write-Host ""

# W&B設定
Write-Host "[Weights & Biases設定]" -ForegroundColor Green
$wandbKey = Read-SecureInput "WANDB_API_KEY"
if ($wandbKey) {
    (Get-Content $envPath) -replace 'WANDB_API_KEY=.*', "WANDB_API_KEY=$wandbKey" | Set-Content $envPath
}

$wandbEntity = Read-Host "WANDB_ENTITY (あなたのユーザー名またはチーム名)"
if ($wandbEntity) {
    (Get-Content $envPath) -replace 'WANDB_ENTITY=.*', "WANDB_ENTITY=$wandbEntity" | Set-Content $envPath
}

Write-Host ""
Write-Host "[GitHub設定]" -ForegroundColor Green
$githubToken = Read-SecureInput "GITHUB_TOKEN"
if ($githubToken) {
    (Get-Content $envPath) -replace 'GITHUB_TOKEN=.*', "GITHUB_TOKEN=$githubToken" | Set-Content $envPath
}

$githubRepo = Read-Host "GITHUB_REPO (例: username/AI_diary_app)"
if ($githubRepo) {
    (Get-Content $envPath) -replace 'GITHUB_REPO=.*', "GITHUB_REPO=$githubRepo" | Set-Content $envPath
}

Write-Host ""
Write-Host "[AI API設定]" -ForegroundColor Green
Write-Host "1. OpenAI" -ForegroundColor Yellow
Write-Host "2. Claude (Anthropic)" -ForegroundColor Yellow
$aiChoice = Read-Host "使用するAIプロバイダーを選択 (1 or 2)"

if ($aiChoice -eq "1") {
    $openaiKey = Read-SecureInput "OPENAI_API_KEY"
    if ($openaiKey) {
        (Get-Content $envPath) -replace 'OPENAI_API_KEY=.*', "OPENAI_API_KEY=$openaiKey" | Set-Content $envPath
        (Get-Content $envPath) -replace 'AI_PROVIDER=.*', "AI_PROVIDER=openai" | Set-Content $envPath
    }
} elseif ($aiChoice -eq "2") {
    $anthropicKey = Read-SecureInput "ANTHROPIC_API_KEY"
    if ($anthropicKey) {
        (Get-Content $envPath) -replace 'ANTHROPIC_API_KEY=.*', "ANTHROPIC_API_KEY=$anthropicKey" | Set-Content $envPath
        (Get-Content $envPath) -replace 'AI_PROVIDER=.*', "AI_PROVIDER=anthropic" | Set-Content $envPath
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ".envファイルの設定が完了しました！" -ForegroundColor Green
Write-Host "ファイルパス: $envPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "注意事項:" -ForegroundColor Red
Write-Host "- .envファイルは絶対にGitにコミットしないでください" -ForegroundColor Red
Write-Host "- APIキーは定期的に更新してください" -ForegroundColor Red
Write-Host ""
Write-Host "次のステップ: npm install && npm run dev" -ForegroundColor Cyan