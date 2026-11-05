$ErrorActionPreference='Stop'
$statePath=Join-Path $PSScriptRoot 'data\server.json'
if(Test-Path -LiteralPath $statePath){
  $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  $process=Get-CimInstance Win32_Process -Filter ("ProcessId="+[int]$state.pid)
  $expectedScript=Join-Path $PSScriptRoot 'app\server.mjs'
  if($process -and $process.Name -eq 'node.exe' -and $process.CommandLine.Contains($expectedScript)){
    Stop-Process -Id $state.pid
    Write-Host 'Market Desk server stopped.'
  } else {Write-Host 'No matching Market Desk server is running.'}
}
