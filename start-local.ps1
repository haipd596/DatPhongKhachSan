$ErrorActionPreference = "Stop"

# Thiết lập thư mục Maven Home cục bộ trong project để tránh lỗi đường dẫn chứa ký tự tiếng Việt/ký tự đặc biệt
$env:MAVEN_USER_HOME = Join-Path $PSScriptRoot ".m2"

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

# Tải Maven qua wrapper nếu chưa có sẵn mvn toàn cục để chuẩn bị cho việc tìm bin path và chạy build
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
    # Cập nhật lại lệnh chạy Maven sang mvn toàn cục vừa được map
    $mvnCmd = "mvn"
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

# Kiểm tra và build file jar nếu chưa tồn tại
$jarPath = Join-Path $PSScriptRoot "backend\target\booking-backend-0.0.1-SNAPSHOT.jar"
if (-not (Test-Path $jarPath)) {
  Write-Host "Không tìm thấy file jar. Đang tiến hành build backend..."
  $pomPath = Join-Path $PSScriptRoot "backend\pom.xml"
  if ($mvnCmd -eq "mvn") {
    & mvn -f $pomPath clean package -DskipTests
  } else {
    $mvnwPath = Join-Path $PSScriptRoot "backend\mvnw.cmd"
    if (Test-Path $mvnwPath) {
      & $mvnwPath -f $pomPath clean package -DskipTests
    } else {
      throw "Không tìm thấy Maven hoặc Maven Wrapper để build dự án."
    }
  }
  
  if ($LASTEXITCODE -ne 0) {
    throw "Build backend thất bại."
  }
}

Write-Host "Chạy backend MySQL local + frontend, không cần Docker..."
npx concurrently -k -n BE,FE -c yellow,cyan "java -jar backend/target/booking-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local" "npm --prefix frontend run dev"
