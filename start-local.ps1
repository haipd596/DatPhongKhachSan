$ErrorActionPreference = "Stop"

# Thiết lập thư mục Maven Home cục bộ trong project để tránh lỗi đường dẫn chứa ký tự tiếng Việt/ký tự đặc biệt
$env:MAVEN_USER_HOME = Join-Path $PSScriptRoot ".m2"

# Hàm tự động tải và cài đặt Maven cục bộ dưới dạng nền tảng độc lập, tránh mọi lỗi của Maven Wrapper hoặc Maven toàn cục
function Get-LocalMaven {
  $mavenHome = Join-Path $PSScriptRoot ".m2"
  $extractPath = Join-Path $mavenHome "apache-maven-3.9.11"
  $mvnCmdPath = Join-Path $extractPath "bin\mvn.cmd"
  
  if (-not (Test-Path $mvnCmdPath)) {
    Write-Host "Không tìm thấy Maven cục bộ. Đang tải và giải nén Maven 3.9.11..."
    if (-not (Test-Path $mavenHome)) {
      New-Item -ItemType Directory -Path $mavenHome -Force | Out-Null
    }
    
    $zipPath = Join-Path $mavenHome "maven.zip"
    $url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip"
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $webclient = New-Object System.Net.WebClient
    $webclient.DownloadFile($url, $zipPath)
    
    Expand-Archive -Path $zipPath -DestinationPath $mavenHome -Force
    Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
  }
  
  # Luôn vá lỗi wildcard trong file mvn.cmd để hỗ trợ đường dẫn Unicode/Tiếng Việt
  if (Test-Path $mvnCmdPath) {
    (Get-Content $mvnCmdPath) -replace 'for %%i in \("%MAVEN_HOME%"\\boot\\plexus-classworlds-\*\) do set CLASSWORLDS_JAR="%%i"', 'set CLASSWORLDS_JAR="%MAVEN_HOME%\boot\plexus-classworlds-2.9.0.jar"' | Set-Content $mvnCmdPath -Force
  }
  
  if (Test-Path $mvnCmdPath) {
    return $mvnCmdPath
  } else {
    throw "Không thể cấu hình Maven cục bộ."
  }
}

# Lấy đường dẫn Maven cục bộ và ghi đè PATH
$mvnCmd = Get-LocalMaven
$mavenBin = Split-Path -Parent $mvnCmd
$env:PATH = "$mavenBin;$env:PATH"

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
  & $mvnCmd -f $pomPath clean package -DskipTests
  
  if ($LASTEXITCODE -ne 0) {
    throw "Build backend thất bại."
  }
}

# Kiểm tra và cài đặt node_modules ở thư mục gốc (root) nếu chưa có
$rootModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $rootModulesPath)) {
  Write-Host "Không tìm thấy node_modules ở thư mục gốc. Đang tiến hành cài đặt..."
  npm install
}

# Kiểm tra và cài đặt node_modules cho frontend nếu chưa có
$feModulesPath = Join-Path $PSScriptRoot "frontend\node_modules"
if (-not (Test-Path $feModulesPath)) {
  Write-Host "Không tìm thấy node_modules của frontend. Đang tiến hành cài đặt dependencies..."
  Push-Location (Join-Path $PSScriptRoot "frontend")
  npm install
  Pop-Location
}

Write-Host "Chạy backend MySQL local + frontend, không cần Docker..."
npx concurrently -k -n BE,FE -c yellow,cyan "java -jar backend/target/booking-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local" "npm --prefix frontend run dev"
