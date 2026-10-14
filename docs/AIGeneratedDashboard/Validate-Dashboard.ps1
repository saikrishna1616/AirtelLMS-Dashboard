param([switch]$OpenDashboard)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$dashboardRoot = Join-Path $repoRoot 'LearnetLinq.WebUI/AIGeneratedDashboard'
$artifacts = Join-Path $PSScriptRoot 'artifacts'
New-Item -ItemType Directory -Path $artifacts -Force | Out-Null
$chromeCandidates = @('C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', (Join-Path $env:LOCALAPPDATA 'Google/Chrome/Application/chrome.exe'))
$chromePath = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chromePath) { throw 'Google Chrome was not found in its standard installation paths.' }
function Run-Headless([string[]]$AdditionalArguments, [string]$OutputName) {
    $profilePath = Join-Path $artifacts ('chrome-profile-' + [Guid]::NewGuid().ToString('N'))
    $stdoutPath = Join-Path $artifacts ($OutputName + '.html')
    $stderrPath = Join-Path $artifacts ($OutputName + '.log')
    $chromeArguments = @('--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', ('--user-data-dir="' + $profilePath + '"')) + $AdditionalArguments
    $process = Start-Process -FilePath $chromePath -ArgumentList $chromeArguments -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru
    if (-not $process.WaitForExit(45000)) { Stop-Process -Id $process.Id -Force; throw ('Chrome timed out during ' + $OutputName) }
    $process.Refresh()
    if ($null -ne $process.ExitCode -and $process.ExitCode -ne 0) { throw ('Chrome failed during ' + $OutputName + '. See ' + $stderrPath) }
    return $stdoutPath
}
$testUrl = ([uri](Join-Path $dashboardRoot 'tests.html')).AbsoluteUri
$testDomPath = Run-Headless @('--allow-file-access-from-files', '--virtual-time-budget=8000', '--dump-dom', ('"' + $testUrl + '"')) 'test-dom'
$testDom = Get-Content -LiteralPath $testDomPath -Raw
$status = [regex]::Match($testDom, 'data-test-status="([^"]+)"').Groups[1].Value
$passed = [regex]::Match($testDom, 'data-passed="(\d+)"').Groups[1].Value
$failed = [regex]::Match($testDom, 'data-failed="(\d+)"').Groups[1].Value
$result = [ordered]@{ timestamp = (Get-Date).ToString('o'); browser = 'Google Chrome'; status = $status; passed = $passed; failed = $failed; dom = 'test-dom.html' }
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $artifacts 'test-results.json') -Encoding UTF8
if ($status -ne 'passed') { throw ('Dashboard tests did not pass. Status: ' + $status + '. See ' + $testDomPath) }
$dashboardUrl = ([uri](Join-Path $dashboardRoot 'index.html')).AbsoluteUri
foreach ($size in @(@{ Name='desktop'; Width=1440; Height=1100 }, @{ Name='mobile'; Width=390; Height=844 })) {
    $imagePath = Join-Path $artifacts ($size.Name + '.png')
    $previewUrl = $dashboardUrl
    if ($size.Name -eq 'mobile') { $previewUrl = ([uri](Join-Path $dashboardRoot 'preview-mobile.html')).AbsoluteUri }
    Run-Headless @(('--window-size=' + $size.Width + ',' + $size.Height), '--virtual-time-budget=2500', ('--screenshot="' + $imagePath + '"'), '--dump-dom', ('"' + $previewUrl + '"')) $size.Name | Out-Null
    if (-not (Test-Path -LiteralPath $imagePath)) { throw ('Missing screenshot: ' + $imagePath) }
}
Write-Output ('Dashboard validation: ' + $passed + ' passed, ' + $failed + ' failed. Screenshots: ' + $artifacts)
if ($OpenDashboard) { Start-Process -FilePath $chromePath -ArgumentList @('--new-window', ('"' + $dashboardUrl + '"')); Write-Output ('Opened Google Chrome: ' + $dashboardUrl) }
