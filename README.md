# Rex Sai Gon Booking - Graduation Project

Monorepo:

- `backend`: Spring Boot API
- `frontend`: React (Vite)

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
