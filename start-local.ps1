$ErrorActionPreference = "Stop"

# Thiết lập thư mục Maven Home cục bộ trong project để tránh lỗi đường dẫn chứa ký tự tiếng Việt/ký tự đặc biệt
$env:MAVEN_USER_HOME = Join-Path $PSScriptRoot ".m2"

# Ưu tiên sử dụng Maven Wrapper của dự án để đảm bảo tính tương thích và độc lập
$mvnCmd = Join-Path $PSScriptRoot "backend\mvnw.cmd"
if (-not (Test-Path $mvnCmd)) {
  $mvnCmd = "mvn"
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
      $mvnCmd = "mvn"
    }
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
