import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { isAuthenticated } from "./services/auth";
import LandingPage from "./pages/LandingPage";
import AuthPage    from "./pages/AuthPage";
import Dashboard   from "./pages/Dashboard";
import AnalyticsPage  from "./pages/AnalyticsPage";

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/"         element={<LandingPage />} />

        {/* Auth — same component handles /login and /register */}
        <Route path="/login"    element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* App */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;