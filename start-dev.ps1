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

Write-Host "Chay FE + BE voi profile local..."
npm run dev
