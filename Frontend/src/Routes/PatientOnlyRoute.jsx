import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UseAuth from "../Hooks/UseAuth";

const PatientOnlyRoute = ({ children }) => {
  console.log("PatientOnlyRoute: Component rendering");
  const { user, loading, userData } = UseAuth();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

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
        setRoleLoading(false);
        return;
      }

      // First, try to get role from userData (which might already be available)
      if (userData?.role) {
        if (!cancelled) {
          setRole(userData.role);
          console.log("PatientOnlyRoute: Role from userData:", userData.role);
          setRoleLoading(false);
          return;
        }
      }

      try {
        const headers = await getAuthHeaders();
        if (!headers) {
          setRoleLoading(false);
          return;
        }

        const apiBase = import.meta?.env?.VITE_API_URL || "";
        const client = axios.create({ baseURL: apiBase, headers });

        // Try to get user profile to determine role
        const res = await client.get("/api/auth/profile");
        if (res?.data?.role) {
          if (!cancelled) {
            setRole(res.data.role);
            console.log("PatientOnlyRoute: Role fetched from API:", res.data.role);
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
              console.log("PatientOnlyRoute: Role fetched from cache:", parsed.role);
            }
          } catch {
            // ignore invalid cache
          }
        }
      } finally {
        if (!cancelled) {
          setRoleLoading(false);
        }
      }
    };

    fetchUserRole();
    return () => {
      cancelled = true;
    };
  }, [user, getAuthHeaders, userData?.role]);

  if (loading || roleLoading) {
    console.log("PatientOnlyRoute: Loading state - loading:", loading, "roleLoading:", roleLoading);
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    console.log("PatientOnlyRoute: No user, redirecting to login");
    return <Navigate state={location.pathname} to="/login" />;
  }

  console.log("PatientOnlyRoute: User:", user.email, "Role:", role);

  // Only allow patients to access this route
  if (role === "patient") {
    console.log("PatientOnlyRoute: Allowing patient access to /doctors");
    return children;
  }

  // If role cannot be determined, still allow access (temporary fix)
  if (!role) {
    console.log("PatientOnlyRoute: Role cannot be determined, but allowing access to /doctors");
    return children;
  }

  // Redirect doctors and admins to their respective dashboards
  if (role === "doctor") {
    console.log("PatientOnlyRoute: Redirecting doctor to dashboard");
    return <Navigate to="/dashboard/doctor" replace />;
  } else if (role === "admin") {
    console.log("PatientOnlyRoute: Redirecting admin to dashboard");
    return <Navigate to="/dashboard/admin" replace />;
  }

  // If role cannot be determined, redirect to patient dashboard as fallback
  console.log("PatientOnlyRoute: Role cannot be determined, redirecting to patient dashboard");
  return <Navigate to="/dashboard/patient" replace />;
};

export default PatientOnlyRoute;
