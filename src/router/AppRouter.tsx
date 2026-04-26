import { BrowserRouter, Routes, Route } from "react-router-dom";

import POSPage from "../pages/pos/POSPage";
import Dashboard from "../pages/admin/Dashboard";
import LoginPage from "../pages/LoginPage";
import AuthGate from "../context/AuthGate";
import SignupPage from "../pages/SignUpPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* PROTECTED */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <Routes>
                <Route path="/pos" element={<POSPage />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
              </Routes>
            </AuthGate>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}