$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).FullName
$drive = 'Z:'
subst $drive /d 2>$null | Out-Null
subst $drive $root
Set-Location $drive

$serverRunning = $false
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8765/index.html' -UseBasicParsing -TimeoutSec 2
  if ($r.StatusCode -eq 200) { $serverRunning = $true }
} catch {}

if (-not $serverRunning) {
  Start-Process python -ArgumentList '-m','http.server','8765','--directory','avi-beauty-studio' -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

npx playwright test tests/booking-messaging.spec.js --project=chromium --reporter=list
$code = $LASTEXITCODE
subst $drive /d 2>$null | Out-Null
exit $code
