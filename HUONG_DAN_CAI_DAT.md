# Hướng dẫn cài đặt dự án Rex Hotel Booking

Tài liệu này dùng cho dự án tại `D:\project\DatPhongKhachSan`.

## 1. Tổng quan công nghệ

Dự án là monorepo gồm 2 phần chính:

- `backend`: Spring Boot API.
- `frontend`: React dùng Vite.
- Database: MySQL 8.4 chạy bằng Docker.

Các cổng mặc định:

| Thành phần | URL / cổng |
| --- | --- |
| Frontend dev | `http://localhost:5173` |
| Backend API | `http://localhost:8080` |
| MySQL | `localhost:3306` |
| Frontend production Docker | `http://localhost` |

## 2. Yêu cầu cài đặt

### 2.1. Backend

Cần cài:

- Java 17.
- Maven 3.9 trở lên.

Kiểm tra:

```powershell
java -version
mvn -version
```

Backend dùng các thư viện chính:

- Spring Boot 3.3.5.
- Spring Web.
- Spring Data JPA.
- Spring Security.
- Spring Validation.
- Spring Mail.
- MySQL Connector/J.
- H2 Database.
- OpenPDF.
- JJWT.
- Lombok.

Các thư viện backend được Maven tự tải theo file:

```text
backend\pom.xml
```

### 2.2. Frontend

Cần cài:

- Node.js 18 trở lên, khuyến nghị Node.js 20.
- npm đi kèm Node.js.

Kiểm tra:

```powershell
node -v
npm -v
```

Frontend dùng các thư viện chính:

- React 18.3.1.
- React DOM 18.3.1.
- React Router DOM 6.30.0.
- Axios 1.8.4.
- date-fns 4.1.0.
- Google Generative AI SDK 0.24.1.
- Vite 5.4.10.

Các thư viện frontend được npm cài theo file:

```text
frontend\package.json
```

### 2.3. Database và Docker

Cần cài:

- Docker Desktop.

Kiểm tra Docker:

```powershell
docker --version
docker compose version
docker info
```

Nếu `docker info` lỗi, hãy mở Docker Desktop và chờ Docker chạy xong.

## 3. Cài thư viện

Mở PowerShell tại thư mục gốc dự án:

```powershell
cd D:\project\DatPhongKhachSan
```

Cài package ở root để chạy script monorepo:

```powershell
npm install
```

Cài package frontend:

```powershell
npm --prefix frontend install
```

Backend không cần lệnh cài riêng. Maven sẽ tự tải dependency khi chạy:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

## 4. Biến môi trường hiện tại của dự án

### 4.1. Backend khi chạy development

Backend đọc biến môi trường trong file:

```text
backend\src\main\resources\application.yml
```

Nếu không khai báo biến môi trường, dự án sẽ dùng các giá trị mặc định sau:

| Biến | Giá trị hiện tại / mặc định | Ý nghĩa |
| --- | --- | --- |
| `DB_HOST` | `localhost` | Host MySQL |
| `DB_PORT` | `3306` | Cổng MySQL |
| `DB_NAME` | `rex_booking` | Tên database |
| `DB_USER` | `rex` | User database |
| `DB_PASSWORD` | `rex123` | Mật khẩu database |
| `APP_JWT_SECRET` | `REPLACE_WITH_AT_LEAST_32_CHARACTERS_SECRET_KEY_REX_2026` | Secret ký JWT |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origin frontend được phép gọi API |
| `VNPAY_MOCK_SECRET` | `RexHotelVNPayMockSecretKey2026` | Secret cho thanh toán VNPay mock |
| `VNPAY_RETURN_URL` | `http://localhost:5173/payment/result` | URL frontend nhận kết quả thanh toán |

Cấu hình datasource thực tế khi không set biến:

```text
jdbc:mysql://localhost:3306/rex_booking?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh
```

### 4.2. MySQL development

MySQL development nằm trong file:

```text
docker-compose.yml
```

Giá trị hiện tại:

| Biến / cấu hình | Giá trị |
| --- | --- |
| Image | `mysql:8.4` |
| Container | `rex_booking_mysql` |
| `MYSQL_ROOT_PASSWORD` | `root123` |
| `MYSQL_DATABASE` | `rex_booking` |
| `MYSQL_USER` | `rex` |
| `MYSQL_PASSWORD` | `rex123` |
| Timezone | `Asia/Ho_Chi_Minh` |
| Port | `3306:3306` |
| Volume | `mysql_data` |

### 4.3. Frontend development

Frontend đọc các biến sau:

| Biến | Giá trị hiện tại / mặc định | Ý nghĩa |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Không có file `.env`, mặc định code dùng `/api` | Base URL gọi backend |
| `VITE_GEMINI_API_KEY` | Chưa cấu hình | API key bật chatbot AI |

Trong dev, Vite proxy `/api` sang backend:

```text
http://localhost:8080
```

Cấu hình proxy nằm tại:

```text
frontend\vite.config.js
```

Nếu muốn tạo file môi trường frontend, tạo file:

```text
frontend\.env.local
```

Ví dụ cho môi trường development:

```env
VITE_API_BASE_URL=/api
VITE_GEMINI_API_KEY=
```

Nếu chưa có Gemini API key thì để trống. Chatbot sẽ báo chức năng AI chưa được cấu hình.

### 4.4. Production Docker

File mẫu hiện tại:

```text
.env.prod.example
```

Nội dung hiện tại:

```env
DB_NAME=rex_booking
DB_USER=rex
DB_PASSWORD=rex123
MYSQL_ROOT_PASSWORD=root123
APP_JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
APP_CORS_ALLOWED_ORIGINS=http://localhost
```

Khi chạy production, tạo file `.env.prod` từ file mẫu:

```powershell
copy .env.prod.example .env.prod
```

Sau đó chỉnh `.env.prod` nếu cần. Ví dụ giữ đúng giá trị hiện tại:

```env
DB_NAME=rex_booking
DB_USER=rex
DB_PASSWORD=rex123
MYSQL_ROOT_PASSWORD=root123
APP_JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
APP_CORS_ALLOWED_ORIGINS=http://localhost
```

Lưu ý: khi triển khai thật, nên đổi `APP_JWT_SECRET`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` sang giá trị mạnh hơn.

## 5. Cách chạy development

### Cách 1: Chạy tự động bằng script có sẵn

Lệnh này sẽ:

- Khởi động MySQL bằng Docker Compose.
- Chờ MySQL healthy.
- Chạy backend và frontend cùng lúc.

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Sau đó mở:

```text
http://localhost:5173
```

### Cách 2: Chạy thủ công từng phần

Khởi động MySQL:

```powershell
npm run db:up
```

Chạy backend:

```powershell
npm run dev:backend
```

Mở PowerShell khác, chạy frontend:

```powershell
npm run dev:frontend
```

Hoặc chạy cả backend và frontend cùng lúc:

```powershell
npm run dev
```

## 6. Cách chạy backend bằng H2 không cần MySQL

Nếu không muốn chạy Docker/MySQL, có thể dùng profile H2:

```powershell
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=h2
```

Database H2 sẽ lưu tại:

```text
data\rexbooking
```

H2 console:

```text
http://localhost:8080/h2-console
```

Thông tin H2:

| Trường | Giá trị |
| --- | --- |
| JDBC URL | `jdbc:h2:file:./data/rexbooking` |
| User | `sa` |
| Password | để trống |

## 7. Cách chạy production bằng Docker

Tạo file môi trường production:

```powershell
copy .env.prod.example .env.prod
```

Chạy build và khởi động toàn bộ hệ thống:

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

Truy cập production:

```text
http://localhost
```

## 8. Lệnh kiểm tra và build

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

## 9. Tài khoản demo có sẵn

Dữ liệu seed tự tạo khi backend khởi động.

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

## 10. Lỗi thường gặp

### Port `3306` đã bị chiếm

Kiểm tra ứng dụng đang dùng port:

```powershell
netstat -ano | findstr :3306
```

Nếu đang có MySQL khác chạy, hãy dừng MySQL đó hoặc đổi port trong `docker-compose.yml`.

### Backend không kết nối được MySQL

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

Trong development, frontend gọi `/api` và Vite proxy sang `http://localhost:8080`.

### Docker Desktop chưa chạy

Mở Docker Desktop trước, chờ trạng thái Docker sẵn sàng, sau đó chạy lại:

```powershell
docker info
```

## 11. Quy trình chạy nhanh khuyến nghị

Lần đầu:

```powershell
cd D:\project\DatPhongKhachSan
npm install
npm --prefix frontend install
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Những lần sau:

```powershell
cd D:\project\DatPhongKhachSan
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

