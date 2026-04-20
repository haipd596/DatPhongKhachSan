import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import ManagerLayout from "./layouts/ManagerLayout";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Customer Pages (Placeholders temporarily until rewrited)
import HomePage from "./pages/customer/Home";
import RoomSearchPage from "./pages/customer/RoomSearch";
import MyBookingsPage from "./pages/customer/MyBookings";
import PaymentResultPage from "./pages/customer/PaymentResult";
import PaymentHistoryPage from "./pages/customer/PaymentHistory";

// Manager Pages (Placeholders temporarily until rewrited)
import DashboardPage from "./pages/manager/Dashboard";
import RoomManagerPage from "./pages/manager/RoomManager";
import BookingManagerPage from "./pages/manager/BookingManager";
import CustomerManagerPage from "./pages/manager/CustomerManager";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/customer/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={<MainLayout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="search" element={<RoomSearchPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="history" element={<PaymentHistoryPage />} />
        </Route>
        {/* Payment Callback doesn't necessarily need the main layout if it's a redirect screen, but it can use it */}
        <Route path="/payment/result" element={<PaymentResultPage />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rooms" element={<RoomManagerPage />} />
          <Route path="bookings" element={<BookingManagerPage />} />
          <Route path="customers" element={<CustomerManagerPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
