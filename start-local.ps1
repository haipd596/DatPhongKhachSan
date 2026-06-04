$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path $envFile)) {
  throw "Không tìm thấy file .env.local tại $envFile"
}

Write-Host "Nạp biến môi trường từ .env.local..."
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) {
    return
  }

  if ($line -match "^\s*([^#=\s]+)\s*=\s*(.*)\s*$") {
    $name = $matches[1]
    $value = $matches[2].Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

Write-Host "Chạy backend H2 + frontend, không cần Docker..."
npx concurrently -k -n BE,FE -c yellow,cyan "mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=local,h2" "npm --prefix frontend run dev"
