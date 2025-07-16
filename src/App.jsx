import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard";
import ServicesPage from "./services";
import LoginPage from "./login";
import EditProfile from "./profile";
import BookService from "./book";
import BookingRequests from "./reqs";
import MyBookings from "./mybook";
import ExplorePage from "./explore";
// --- IMPORT THE NEW WRAPPER ---
import ProtectedRoute from "./protected";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="explore" element={<ExplorePage />} />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-requests"
          element={
            <ProtectedRoute adminOnly={true}>
              <BookingRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
export default App;
