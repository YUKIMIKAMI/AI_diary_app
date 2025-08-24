# PowerShell script for completion notification
param(
    [string]$Message = "Task completed!",
    [string]$Title = "AI Diary App"
)

# Play system sound
[System.Media.SystemSounds]::Exclamation.Play()

# Alternative: Use beep
# [console]::beep(1000, 500)

# Show Windows notification
Add-Type -AssemblyName System.Windows.Forms
$notification = New-Object System.Windows.Forms.NotifyIcon
$notification.Icon = [System.Drawing.SystemIcons]::Information
$notification.BalloonTipIcon = 'Info'
$notification.BalloonTipTitle = $Title
$notification.BalloonTipText = $Message
$notification.Visible = $true
$notification.ShowBalloonTip(5000)

Write-Host "✅ $Message" -ForegroundColor Green