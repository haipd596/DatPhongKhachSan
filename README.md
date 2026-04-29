# Rex Sài Gòn Booking

Rex Sài Gòn Booking là hệ thống đặt phòng khách sạn phục vụ đồ án tốt nghiệp. Dự án được xây dựng theo mô hình monorepo, gồm backend Spring Boot, frontend React/Vite và database MySQL.

Hệ thống hỗ trợ khách hàng tìm phòng, giữ phòng, thanh toán mô phỏng, quản lý lịch sử đặt phòng và đánh giá dịch vụ. Phía quản lý có các chức năng quản trị phòng, loại phòng, booking, khách hàng và dashboard thống kê.

## Chức năng chính

### Khách hàng

- Đăng ký, đăng nhập, quên mật khẩu và đặt lại mật khẩu.
- Xem thông tin tài khoản hiện tại.
- Tìm phòng trống theo ngày nhận phòng và ngày trả phòng.
- Xem số lượng phòng còn trống theo từng loại phòng.
- Giữ phòng trong thời gian cấu hình sẵn.
- Thanh toán mô phỏng để xác nhận booking.
- Xem lịch sử đặt phòng.
- Hủy booking theo điều kiện hệ thống.
- Tải PDF xác nhận hoặc hủy booking.
- Gửi đánh giá dịch vụ.
- Xem thông tin bản đồ và hỏi đáp qua chatbot FAQ.
- Nhận chính sách VIP tự động gồm `NORMAL`, `SILVER`, `GOLD`.

### Quản lý

- Đăng nhập bằng tài khoản quản lý.
- Xem dashboard tổng quan: phòng, booking, doanh thu, điểm đánh giá trung bình.
- Quản lý loại phòng và phòng.
- Theo dõi danh sách booking.
- Quản lý thông tin khách hàng.
- Xem dữ liệu đánh giá mới nhất.

### Hệ thống

- Phân quyền người dùng theo vai trò `CUSTOMER` và `MANAGER`.
- Xác thực bằng JWT.
- Seed dữ liệu demo tự động khi backend khởi động.
- Tự động hết hạn các booking đang giữ quá thời gian.
- Gửi email dạng mock logger mặc định, có thể cấu hình SMTP sau.
- Hỗ trợ chạy development bằng MySQL Docker hoặc H2.
- Hỗ trợ triển khai production bằng Docker Compose.

## Cấu trúc dự án

```text
DatPhongKhachSan
├── backend
│   └── Spring Boot API
├── frontend
│   └── React + Vite
├── docker-compose.yml
├── docker-compose.prod.yml
├── start-dev.ps1
├── Run_App.bat
├── package.json
└── README.md
```

## Yêu cầu hệ thống

### Backend

- Java 17.
- Maven 3.9 trở lên.

Kiểm tra:

```powershell
java -version
mvn -version
```

### Frontend

- Node.js 18 trở lên, khuyến nghị Node.js 20.
- npm.

Kiểm tra:

```powershell
node -v
npm -v
```

### Database và Docker

- Docker Desktop.
- Docker Compose.

Kiểm tra:

```powershell
docker --version
docker compose version
docker info
```

Nếu `docker info` báo lỗi, hãy mở Docker Desktop và chờ Docker chạy sẵn sàng.

## Cấu hình mặc định

### Cổng chạy

| Thành phần | URL / cổng |
| --- | --- |
| Frontend development | `http://localhost:5173` |
| Backend API | `http://localhost:8080` |
| MySQL | `localhost:3306` |
| Frontend production Docker | `http://localhost` |

### Database MySQL development

| Cấu hình | Giá trị |
| --- | --- |
| Host | `localhost` |
| Port | `3306` |
| Database | `rex_booking` |
| User | `rex` |
| Password | `rex123` |
| Root password | `root123` |
| Container | `rex_booking_mysql` |

### Biến môi trường backend

Khi không khai báo biến môi trường riêng, backend dùng các giá trị mặc định trong `backend/src/main/resources/application.yml`.

| Biến | Giá trị mặc định |
| --- | --- |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `rex_booking` |
| `DB_USER` | `rex` |
| `DB_PASSWORD` | `rex123` |
| `APP_JWT_SECRET` | `REPLACE_WITH_AT_LEAST_32_CHARACTERS_SECRET_KEY_REX_2026` |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| `VNPAY_MOCK_SECRET` | `RexHotelVNPayMockSecretKey2026` |
| `VNPAY_RETURN_URL` | `http://localhost:5173/payment/result` |

### Biến môi trường frontend

Frontend hiện chưa có file `.env` mặc định. Code đang đọc các biến sau:

| Biến | Giá trị hiện tại / mặc định |
| --- | --- |
| `VITE_API_BASE_URL` | Không cấu hình thì dùng `/api` |
| `VITE_GEMINI_API_KEY` | Chưa cấu hình |

Trong môi trường development, Vite proxy `/api` sang `http://localhost:8080`.

Nếu muốn tạo file môi trường frontend:

```powershell
New-Item frontend\.env.local -ItemType File
```

Nội dung ví dụ:

```env
VITE_API_BASE_URL=/api
VITE_GEMINI_API_KEY=
```

## Hướng dẫn cài đặt và chạy development

Mở PowerShell tại thư mục dự án:

```powershell
cd D:\project\DatPhongKhachSan
```

Cài thư viện ở root để chạy script monorepo:

```powershell
npm install
```

Cài thư viện frontend:

```powershell
npm --prefix frontend install
```

Backend không cần cài thư viện thủ công. Maven sẽ tự tải dependency khi chạy backend.

### Cách 1: Chạy nhanh bằng script

Lệnh này sẽ khởi động MySQL bằng Docker, chờ database sẵn sàng, sau đó chạy backend và frontend cùng lúc.

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Truy cập frontend:

```text
http://localhost:5173
```

### Cách 2: Chạy thủ công

Khởi động MySQL:

```powershell
npm run db:up
```

Chạy backend:

```powershell
npm run dev:backend
```

Mở PowerShell khác và chạy frontend:

```powershell
npm run dev:frontend
```

Hoặc chạy backend và frontend cùng lúc:

```powershell
npm run dev
```

## Chạy backend bằng H2 không cần MySQL

Nếu không muốn dùng Docker/MySQL, có thể chạy backend bằng H2:

```powershell
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=h2
```

Thông tin H2:

| Trường | Giá trị |
| --- | --- |
| JDBC URL | `jdbc:h2:file:./data/rexbooking` |
| User | `sa` |
| Password | để trống |
| H2 console | `http://localhost:8080/h2-console` |

## Hướng dẫn chạy production bằng Docker

Tạo file biến môi trường production:

```powershell
copy .env.prod.example .env.prod
```

Nội dung mặc định của `.env.prod.example`:

```env
DB_NAME=rex_booking
DB_USER=rex
DB_PASSWORD=rex123
MYSQL_ROOT_PASSWORD=root123
APP_JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
APP_CORS_ALLOWED_ORIGINS=http://localhost
```

Khi triển khai thật, nên đổi `APP_JWT_SECRET`, `DB_PASSWORD` và `MYSQL_ROOT_PASSWORD` sang giá trị mạnh hơn.

Build và chạy production:

```powershell
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Xem log:

```powershell
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f
```

Dừng production:

```powershell
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

Truy cập:

```text
http://localhost
```

## Lệnh build và kiểm tra

Build frontend:

```powershell
npm --prefix frontend run build
```

Build backend:

```powershell
mvn -f backend/pom.xml package
```

Build backend bỏ qua test:

```powershell
mvn -f backend/pom.xml -DskipTests package
```

## Tài khoản demo

Dữ liệu demo được seed tự động khi backend khởi động.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản lý | `manager@rex.local` | `Manager@123` |
| Khách hàng A | `customer1@rex.local` | `Customer@123` |
| Khách hàng B | `customer2@rex.local` | `Customer@123` |
| Khách hàng C | `customer3@rex.local` | `Customer@123` |

File seed dữ liệu:

```text
backend\src\main\java\com\rexhotel\booking\config\DataInitializer.java
```

## Lỗi thường gặp

### Docker chưa chạy

Mở Docker Desktop, chờ Docker sẵn sàng rồi chạy lại:

```powershell
docker info
```

### Port `3306` đã bị chiếm

Kiểm tra tiến trình đang dùng port:

```powershell
netstat -ano | findstr :3306
```

Sau đó dừng MySQL khác hoặc đổi port trong `docker-compose.yml`.

### Backend không kết nối được database

Kiểm tra container MySQL:

```powershell
docker ps
docker compose logs -f mysql
```

Khởi động lại database:

```powershell
npm run db:down
npm run db:up
```

### Frontend gọi API lỗi

Kiểm tra backend đã chạy tại:

```text
http://localhost:8080
```

Trong development, frontend gọi `/api` và Vite proxy sang backend tại `http://localhost:8080`.

