# Rex Sai Gon Booking - Graduation Project

Monorepo:

- `backend`: Spring Boot API
- `frontend`: React (Vite)

## Milestone 1 (done)

- Auth APIs: register, login, forgot password, reset password, me
- Role model: `CUSTOMER`, `MANAGER`
- JWT security + protected manager route
- React auth flow + role-based UI routing

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
