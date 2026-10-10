import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Playground from "./pages/Playground";
import ApiKeys from "./pages/ApiKeys";
import Usage from "./pages/Usage";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/playground"
                  element={<Playground />}
                />

                <Route
                  path="/api-keys"
                  element={<ApiKeys />}
                />

                <Route
                  path="/usage"
                  element={<Usage />}
                />

                <Route
                  path="/monitoring"
                  element={<Monitoring />}
                />

                  <Route
                      path="/settings"
                      element={<Settings />}
                  />

              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
