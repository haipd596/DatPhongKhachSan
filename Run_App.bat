@echo off
echo ==============================================================
echo KHOI DONG HE THONG REX HOTEL BOOKING (DOCKER)
echo ==============================================================
echo.

echo Kiem tra Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [Loi] Docker chua duoc bat hoac chua san sang!
    echo Vui long mo 'Docker Desktop' tu Start Menu va xac nhan bieu tuong mau xanh truoc khi tiep tuc.
    pause
    exit /b
)

echo.
echo [1/3] Bat dau xay dung va khoi tao Database (MySQL 8.4)...
echo [2/3] Xay dung Frontend (React/Vite) va Backend (Spring Boot)...
echo [3/3] Lien ket he thong...
echo.

docker-compose -f docker-compose.prod.yml up -d --build

echo.
echo ==============================================================
echo HOAN TAT!
echo Frontend (Khach hang + Quan ly): http://localhost
echo DB: localhost:3306
echo.
echo ==============================================================
pause
