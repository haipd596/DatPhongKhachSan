$ErrorActionPreference = "Stop"

Write-Host "Khoi dong MySQL bang docker-compose..."
docker compose up -d mysql

Write-Host "Cho MySQL healthy..."
for ($i = 0; $i -lt 30; $i++) {
  $health = docker inspect --format "{{.State.Health.Status}}" rex_booking_mysql 2>$null
  if ($health -eq "healthy") {
    Write-Host "MySQL da san sang."
    break
  }
  Start-Sleep -Seconds 2
}

Write-Host "Chay FE + BE..."
npm run dev
