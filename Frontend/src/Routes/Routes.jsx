import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Error from "../Error/Error";
import UseAuth from "../Hooks/UseAuth";
import Dashboard from "../Layout/Dashboard";
import Roots from "../Layout/Roots";
import DoctorDashboard from "../Pages/Dashboard/Doctor Panel/DoctorDashboard";
import PatientDashboard from "../Pages/Dashboard/Patient Panel/PatientDashboard";
import Doctors from "../Pages/Doctors/Doctors";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import PatientOnlyRoute from "./PatientOnlyRoute";
import PrivateRoute from "./PrivateRoute";

// Component to handle automatic dashboard redirection based on user role
const DashboardRedirect = () => {
  const { user } = UseAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback(async () => {
    try {
      const token = await user?.getIdToken?.();
      if (!token) return null;
      return { Authorization: `Bearer ${token}` };
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const headers = await getAuthHeaders();
        if (!headers) {
          setLoading(false);
          return;
        }

        const apiBase = import.meta?.env?.VITE_API_URL || "";
        const client = axios.create({ baseURL: apiBase, headers });

        // Try to get user profile to determine role
        const res = await client.get("/api/auth/profile");
        if (res?.data?.role) {
          if (!cancelled) {
            setRole(res.data.role);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        // Fallback: try to determine role from cached data
        const roleStorageKey = `role:${user.email}`;
        const cached = localStorage.getItem(roleStorageKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.role && !cancelled) {
              setRole(parsed.role);
            }
          } catch {
            // ignore invalid cache
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUserRole();
    return () => {
      cancelled = true;
    };
  }, [user, getAuthHeaders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  // Redirect based on role
  if (role === "doctor") {
    // For doctors, redirect to their specific route based on email
    const email = user?.email;
    if (email) {
      // Map email to route slug
      const emailToSlug = {
        "john.smith@healthcare.com": "john-smith",
        "sarah.wilson@healthcare.com": "sarah-wilson",
        "michael.brown@healthcare.com": "michael-brown",
        "emily.davis@healthcare.com": "emily-davis",
      };
      const slug = emailToSlug[email];
      if (slug) {
        return <Navigate to={`/dashboard/doctor/${slug}`} replace />;
      }
    }
    // Fallback to general doctor route
    return <Navigate to="/dashboard/doctor" replace />;
  } else if (role === "patient") {
    return <Navigate to="/dashboard/patient" replace />;
  } else if (role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  } else {
    // Fallback to patient dashboard if role cannot be determined
    return <Navigate to="/dashboard/patient" replace />;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Roots />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/doctors",
        element: (
          <PatientOnlyRoute>
            <Doctors></Doctors>
          </PatientOnlyRoute>
        ), 
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <PrivateRoute>
        <Dashboard></Dashboard>
      </PrivateRoute>
    ),
    children: [
      {
        path: "", // Default dashboard route
        element: <DashboardRedirect />,
      },
      {
        path: "doctor",
        element: <DoctorDashboard></DoctorDashboard>,
      },
      {
        path: "doctor/:doctorSlug", // Individual doctor routes
        element: <DoctorDashboard></DoctorDashboard>,
      },
      {
        path: "patient",
        element: <PatientDashboard></PatientDashboard>,
      },
      {
        path: "admin",
        element: <DoctorDashboard></DoctorDashboard>, // Admin can use doctor dashboard for now
      },
    ],
  },
]);

export default router;
