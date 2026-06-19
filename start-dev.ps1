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

# Đảm bảo Maven đã được tải qua Wrapper nếu chưa có mvn toàn cục
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
  $mvnwPath = Join-Path $PSScriptRoot "backend\mvnw.cmd"
  if (Test-Path $mvnwPath) {
    Write-Host "Đang chuẩn bị Maven qua Wrapper..."
    & $mvnwPath -f (Join-Path $PSScriptRoot "backend\pom.xml") --version | Out-Null
  }
}

# Tự động tìm kiếm thư mục bin của Maven Wrapper đã tải và thêm vào PATH
$distsPath = Join-Path $env:MAVEN_USER_HOME "wrapper\dists"
if (Test-Path $distsPath) {
  $mavenBin = Get-ChildItem -Path $distsPath -Recurse -Filter "mvn.cmd" | Select-Object -First 1 -ExpandProperty DirectoryName
  if ($mavenBin) {
    $env:PATH = "$mavenBin;$env:PATH"
  }
}

Write-Host "Chay FE + BE voi profile local..."
npm run dev
