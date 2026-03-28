# Rex Sai Gon Booking - Graduation Project

Monorepo:

- `backend`: Spring Boot API
- `frontend`: React (Vite)

## One-command run

```bash
npm install
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Hoac chay truc tiep:

```bash
npm run dev
```

## Database setup (MySQL)

```bash
npm run db:up
```

Thong so mac dinh:

- Host: `localhost`
- Port: `3306`
- Database: `rex_booking`
- User: `rex`
- Password: `rex123`
- Root password: `root123`

Dung profile H2 neu can:

```bash
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=h2
```

## Docker deployment (production-ready)

1. Tao file env:

```bash
copy .env.prod.example .env.prod
```

2. Chinh gia tri trong `.env.prod` (dac biet `APP_JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`).

3. Deploy:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

4. Kiem tra logs:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f
```

5. Dung deploy:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

## Railway deploy notes

- Deploy 2 service rieng:
- Service backend: root directory `backend`, su dung [backend/railway.toml](D:/project/DatPhongKhachSan/backend/railway.toml)
- Service frontend: root directory `frontend`, su dung [frontend/railway.toml](D:/project/DatPhongKhachSan/frontend/railway.toml)

Luu y frontend da ho tro `PORT` dong qua [nginx.conf.template](D:/project/DatPhongKhachSan/frontend/nginx.conf.template).

## Milestone 1 (done)

- Auth APIs: register, login, forgot password, reset password, me
- Role model: `CUSTOMER`, `MANAGER`
- JWT security + protected manager route
- React auth flow + role-based UI routing

## Milestone 2 (done)

- RoomType + Room entities and manager CRUD APIs
- Availability search by date range (`checkIn`, `checkOut`)
- Availability summary by room type
- Seed demo room data
- Frontend customer search screen + manager room management screen

## Milestone 3 (done)

- Booking hold API with configurable hold minutes
- Auto-expire hold bookings by scheduler
- Customer booking history + cancel booking API
- Mock payment success API and payment transaction table
- Frontend flow: hold room -> pay mock -> cancel -> history

## Milestone 4 (done)

- VIP policy auto-level: `NORMAL`, `SILVER`, `GOLD`
- Auto increase booking count and update VIP after payment success
- Discount is applied when creating hold booking
- API to read current customer VIP status and discount rate

## Milestone 5 (done)

- Email notifications (mock logger by default, SMTP optional)
- PDF export for booking confirmation/cancellation
- Review APIs: submit + read latest reviews
- Manager dashboard API: rooms, bookings, revenue, avg rating
- Frontend additions: review UI, map embed, FAQ chatbot, PDF download

## Quick start

### Backend

Requirements:

- Java 17
- Maven 3.9+

Run:

```bash
cd backend
mvn spring-boot:run
```

Default seeded manager account:

- email: `manager@rex.local`
- password: `Manager@123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`
Backend URL: `http://localhost:8080`

## Demo accounts (seed san)

- Manager: `manager@rex.local` / `Manager@123`
- Customer A: `customer1@rex.local` / `Customer@123`
- Customer B: `customer2@rex.local` / `Customer@123`
- Customer C: `customer3@rex.local` / `Customer@123`

## Seeding

Seed duoc thuc hien tu dong khi backend start qua:

- [DataInitializer.java](D:/project/DatPhongKhachSan/backend/src/main/java/com/rexhotel/booking/config/DataInitializer.java)

Du lieu seed gom:

- manager + 3 customer demo
- room types + rooms
- bookings da xac nhan / dang hold / da huy / het han
- payment transactions
- reviews

## Script demo 10 phut

1. Dang nhap `manager@rex.local`, mo dashboard xem tong phong, booking, doanh thu, diem danh gia.
2. Vao danh sach loai phong/phong, tao them 1 phong de demo CRUD.
3. Dang xuat, dang nhap `customer2@rex.local` (VIP SILVER).
4. Tim phong theo ngay, xem so phong trong theo loai.
5. Giu phong 1 phong, quan sat booking o trang thai `HOLD`.
6. Thanh toan mo phong -> booking sang `CONFIRMED`.
7. Tai PDF xac nhan booking.
8. Gui 1 danh gia dich vu moi.
9. Mo chatbot FAQ va hoi "gio check-in" de demo ho tro khach.
10. Quay lai manager dashboard, refresh va trinh bay chi so da cap nhat.
