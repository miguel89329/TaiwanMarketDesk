param([string]$TargetDirectory)
$ErrorActionPreference='Stop'
try {
  if(-not $TargetDirectory){
    Add-Type -AssemblyName System.Windows.Forms
    $picker=New-Object System.Windows.Forms.FolderBrowserDialog
    $picker.Description='請選擇舊版 TaiwanMarketDesk 程式資料夾（保留其中的 data）'
    if($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK){exit 0}
    $TargetDirectory=$picker.SelectedPath
  }
  $target=(Resolve-Path -LiteralPath $TargetDirectory).Path
  if(-not (Test-Path -LiteralPath (Join-Path $target 'app\engine.mjs'))){throw 'This is not a TaiwanMarketDesk folder.'}
  if($target.TrimEnd('\') -eq $PSScriptRoot.TrimEnd('\')){throw 'Choose the old app folder, not this update folder.'}
  $stateFile=Join-Path $target 'data\server.json'
  if(Test-Path -LiteralPath $stateFile){
    $state=Get-Content -LiteralPath $stateFile -Raw|ConvertFrom-Json
    $process=Get-CimInstance Win32_Process -Filter ('ProcessId='+[int]$state.pid)
    if($process -and $process.Name -eq 'node.exe' -and $process.CommandLine.Contains((Join-Path $target 'app\server.mjs'))){Stop-Process -Id $state.pid; Start-Sleep -Milliseconds 500}
  }
  $backup=Join-Path $target ('backup-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
  New-Item -ItemType Directory -Path $backup | Out-Null
  Copy-Item -LiteralPath (Join-Path $target 'app') -Destination $backup -Recurse
  if(Test-Path -LiteralPath (Join-Path $target 'config.json')){Copy-Item -LiteralPath (Join-Path $target 'config.json') -Destination $backup}
  Copy-Item -Path (Join-Path $PSScriptRoot 'app\*') -Destination (Join-Path $target 'app') -Force
  foreach($name in @('Start.cmd','Start.ps1','Stop.cmd','Stop.ps1','README.md','RULES-v0.2.md','DATA_SOURCES.md','LIMITATIONS.md','VALIDATION.md')){if(Test-Path -LiteralPath (Join-Path $PSScriptRoot $name)){Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination (Join-Path $target $name) -Force}}
  $defaults=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'config.json') -Raw -Encoding UTF8|ConvertFrom-Json
  $configFile=Join-Path $target 'config.json'
  $current=Get-Content -LiteralPath $configFile -Raw -Encoding UTF8|ConvertFrom-Json
  foreach($property in $defaults.psobject.Properties){if(-not $current.psobject.Properties[$property.Name]){$current|Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value}}
  foreach($property in $defaults.rules.psobject.Properties){if(-not $current.rules.psobject.Properties[$property.Name]){$current.rules|Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value}}
  $json=$current|ConvertTo-Json -Depth 30
  [System.IO.File]::WriteAllText($configFile,$json,[System.Text.UTF8Encoding]::new($false))
  Write-Host 'Upgrade complete. Your data folder was preserved.'
  Write-Host "Backup: $backup"
  Write-Host 'Run Start.cmd in the old app folder.'
}catch{Write-Host $_.Exception.Message -ForegroundColor Red;exit 1}
