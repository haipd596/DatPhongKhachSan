$ErrorActionPreference = "Stop"

# Thiết lập thư mục Maven Home cục bộ trong project để tránh lỗi đường dẫn chứa ký tự tiếng Việt/ký tự đặc biệt
$env:MAVEN_USER_HOME = Join-Path $PSScriptRoot ".m2"

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

# Chuẩn bị Maven Wrapper (tải về nếu chưa có) và override PATH để tránh các bản Maven toàn cục bị lỗi
if (Test-Path (Join-Path $PSScriptRoot "backend\mvnw.cmd")) {
  Write-Host "Đang chuẩn bị Maven qua Wrapper..."
  & (Join-Path $PSScriptRoot "backend\mvnw.cmd") -f (Join-Path $PSScriptRoot "backend\pom.xml") --version | Out-Null
  
  $distsPath = Join-Path $env:MAVEN_USER_HOME "wrapper\dists"
  if (Test-Path $distsPath) {
    $mavenBin = Get-ChildItem -Path $distsPath -Recurse -Filter "mvn.cmd" | Select-Object -First 1 -ExpandProperty DirectoryName
    if ($mavenBin) {
      # Đè Maven Wrapper lên đầu PATH để ghi đè mọi bản Maven toàn cục bị lỗi
      $env:PATH = "$mavenBin;$env:PATH"
    }
  }
}

Write-Host "Chay FE + BE voi profile local..."
npm run dev
