param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
try {
  Set-Location -LiteralPath $PSScriptRoot
  $dataPath=Join-Path $PSScriptRoot 'data'
  New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
  $statePath=Join-Path $dataPath 'server.json'
  $appUrl=$null
  if(Test-Path -LiteralPath $statePath){
    try {
      $previous=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
      if($previous.url -match '^http://127\.0\.0\.1:\d+$'){
        $check=Invoke-WebRequest -Uri $previous.url -UseBasicParsing -TimeoutSec 2
        if($check.StatusCode -eq 200 -and $check.Content -match 'sectorChart'){$appUrl=$previous.url}
      }
    } catch {}
  }
  if(-not $appUrl){
    $nodeCommand=Get-Command node -ErrorAction SilentlyContinue
    $candidates=@((Join-Path $PSScriptRoot 'runtime\node.exe'),$nodeCommand.Source,"$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",'C:\Program Files\nodejs\node.exe')
    $runtime=$candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
    if(-not $runtime){throw 'Node.js 24+ was not found. Extract the entire portable ZIP, including runtime.'}
    $version=& $runtime -p 'process.versions.node'
    if([int]($version.Split('.')[0]) -lt 24){throw "Node.js 24+ required. Found $version"}
    $scriptPath=Join-Path $PSScriptRoot 'app\server.mjs'
    $started=Start-Process -FilePath $runtime -ArgumentList @(('"'+$scriptPath+'"'),'--no-open') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $dataPath 'startup.log') -RedirectStandardError (Join-Path $dataPath 'startup-error.log')
    Write-Host "Starting local server (PID $($started.Id))..."
    for($attempt=0;$attempt -lt 60;$attempt++){
      Start-Sleep -Milliseconds 250
      $started.Refresh()
      if($started.HasExited){throw ('Server exited. '+(Get-Content (Join-Path $dataPath 'startup-error.log') -Raw -ErrorAction SilentlyContinue))}
      if(Test-Path -LiteralPath $statePath){
        try{
          $current=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
          if($current.pid -eq $started.Id -and $current.url -match '^http://127\.0\.0\.1:\d+$'){
            $appUrl=$current.url
            break
          }
        }catch{}
      }
    }
    if(-not $appUrl){throw 'Startup timed out. See data\startup-error.log.'}
  }
  Write-Host "Market Desk is ready: $appUrl"
  Write-Host 'If no browser opens, copy this address into your browser.'
  if(-not $NoBrowser){Start-Process -FilePath $appUrl}
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
