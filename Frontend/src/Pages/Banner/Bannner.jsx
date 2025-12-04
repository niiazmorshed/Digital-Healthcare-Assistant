import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import UseAuth from "../../Hooks/UseAuth";

const Bannner = () => {
  const { user, userData } = UseAuth();
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

      if (userData?.role) {
        if (!cancelled) {
          setRole(userData.role);
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

        const res = await client.get("/api/auth/profile");
        if (res?.data?.role) {
          if (!cancelled) {
            setRole(res.data.role);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
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
          setRoleLoading(false);
        }
      }
    };

    fetchUserRole();
    return () => {
      cancelled = true;
    };
  }, [user, getAuthHeaders, userData?.role]);

  const shouldShowFindDoctorsButton = role === "patient" || (!user && !roleLoading);
  
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Health, Our Priority
        </h1>
        <p className="hero-subtitle">
          Connect with experienced healthcare professionals and get the care you deserve
        </p>

        {shouldShowFindDoctorsButton && (
          <NavLink to="/doctors">
            <button className="hero-cta-button">
              Browse Doctors
            </button>
          </NavLink>
        )}
      </div>
    </section>
  );
};

export default Bannner;
