$ErrorActionPreference = "Stop"

Write-Host "Khoi dong MySQL va MailHog bang docker-compose..."
docker compose up -d mysql mailhog

Write-Host "Cho MySQL healthy..."
for ($i = 0; $i -lt 30; $i++) {
  $health = docker inspect --format "{{.State.Health.Status}}" rex_booking_mysql 2>$null
  if ($health -eq "healthy") {
    Write-Host "MySQL da san sang."
    break
  }
  Start-Sleep -Seconds 2
}

# Cấu hình Maven PATH nếu có IntelliJ
$intellijMaven = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin"
if (Test-Path $intellijMaven) {
  $env:PATH = "$intellijMaven;$env:PATH"
}

Write-Host "Chay FE + BE voi profile local..."
npm run dev
