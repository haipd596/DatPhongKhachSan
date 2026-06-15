$ErrorActionPreference = "Stop"

# Xác định lệnh chạy Maven (ưu tiên mvn toàn cục, sau đó tới IntelliJ và Maven Wrapper)
$mvnCmd = "mvn"
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
  $intellijMaven = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin"
  if (Test-Path $intellijMaven) {
    $env:PATH = "$intellijMaven;$env:PATH"
  } elseif (Test-Path (Join-Path $PSScriptRoot "backend\mvnw.cmd")) {
    $mvnCmd = "backend\mvnw.cmd"
  }
}

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

Write-Host "Chạy backend MySQL local + frontend, không cần Docker..."
npx concurrently -k -n BE,FE -c yellow,cyan "java -jar backend/target/booking-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local" "npm --prefix frontend run dev"
