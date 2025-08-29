import { Link, NavLink, useNavigate } from "react-router-dom";
import "./nav.css";
// import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Dark from "../../Dark Mode/Dark";
import UseAuth from "../../Hooks/UseAuth";

const Navbar = () => {
  const { user, logOut } = UseAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [resolving, setResolving] = useState(false);

  // Cache key per user for role persistence
  const roleStorageKey = useMemo(() => (user?.email ? `role:${user.email}` : null), [user?.email]);

  // Resolve color classes and icon per role
  const roleUi = useMemo(() => {
    if (role === "admin") return { badge: "badge-error", icon: "🛡️" };
    if (role === "doctor") return { badge: "badge-info", icon: "🩺" };
    if (role === "patient") return { badge: "badge-success", icon: "🧑‍⚕️" };
    return { badge: "badge-ghost", icon: "❓" };
  }, [role]);

  const fetchIdToken = useCallback(async () => {
    try {
      if (!user) return null;
      const token = await user.getIdToken?.();
      return token || null;
    } catch {
      return null;
    }
  }, [user]);

  const fetchRole = useCallback(async () => {
    // Try cache first
    if (roleStorageKey) {
      const cached = localStorage.getItem(roleStorageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.role) return parsed.role;
        } catch {
          console.debug("Ignoring invalid cached role entry");
        }
      }
    }

    const token = await fetchIdToken();
    if (!token) throw new Error("Not authenticated");

    const headers = { Authorization: `Bearer ${token}` };
    // 1) Try profile endpoint
    try {
      const res = await fetch(`/api/auth/profile`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.role) return data.role;
      }
    } catch {
      console.debug("Profile role fetch failed; trying role-check endpoints");
    }

    // 2) Fallback to role check endpoints by email
    const email = user?.email;
    if (!email) throw new Error("Missing email");
    try {
      const [isAdminRes, isDoctorRes, isPatientRes] = await Promise.all([
        fetch(`/api/users/check-admin/${encodeURIComponent(email)}`, { headers }),
        fetch(`/api/users/check-doctor/${encodeURIComponent(email)}`, { headers }),
        fetch(`/api/users/check-patient/${encodeURIComponent(email)}`, { headers }),
      ]);
      if (isAdminRes.ok) {
        const d = await isAdminRes.json();
        if (d?.isAdmin || d?.role === "admin") return "admin";
      }
      if (isDoctorRes.ok) {
        const d = await isDoctorRes.json();
        if (d?.isDoctor || d?.role === "doctor") return "doctor";
      }
      if (isPatientRes.ok) {
        const d = await isPatientRes.json();
        if (d?.isPatient || d?.role === "patient") return "patient";
      }
    } catch {
      console.debug("Role check endpoints failed");
    }
    throw new Error("Unable to determine role");
  }, [fetchIdToken, roleStorageKey, user?.email]);

  // Initialize role from cache or API when user changes
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRole(null);
      return;
    }
    (async () => {
      try {
        const r = await fetchRole();
        if (!cancelled) {
          setRole(r);
          if (roleStorageKey) {
            localStorage.setItem(roleStorageKey, JSON.stringify({ role: r, email: user.email }));
          }
        }
      } catch {
        if (!cancelled) setRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchRole, roleStorageKey]);

  const handleGoToDashboard = useCallback(async () => {
    try {
      setResolving(true);
      const token = await fetchIdToken();
      if (!token) {
        localStorage.setItem("intended_route", "/dashboard");
        navigate("/login");
        return;
      }
      // Navigate to general dashboard - the route will handle redirection based on role
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Could not open dashboard. Please try again.");
      navigate("/dashboard");
    } finally {
      setResolving(false);
    }
  }, [fetchIdToken, navigate]);

  const handleLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logout Successfully");
        if (roleStorageKey) localStorage.removeItem(roleStorageKey);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Logout failed. Please try again.");
      });
  };

  const linkClass = ({ isActive }) =>
    `text-sm md:text-base font-semibold transition-colors px-2 ${
      isActive ? 'text-blue-500' : 'text-white'
    } hover:text-blue-400`;

  const navLinks = (
    <>
      <NavLink to="/" className={linkClass}>
        <li>
          <a>Home</a>
        </li>
      </NavLink>
      <NavLink to="/doctors" className={linkClass}>
        <li>
          <a>Doctors</a>
        </li>
      </NavLink>
      <NavLink to="/review" className={linkClass}>
        <li>
          <a>Review</a>
        </li>
      </NavLink>
      <NavLink to="/aboutus" className={linkClass}>
        <li>
          <a>About Us</a>
        </li>
      </NavLink>
    </>
  );
  return (
    <div className="navbar fixed bg-gray-800 z-10 top-0 shadow-md">
      {/* fixed */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navLinks}
          </ul>
        </div>
        <Link to="/">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-white">Digital</span>{" "}
            <span className="text-blue-500">Healthcare</span>
          </h1>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">{navLinks}</ul>
      </div>

      <div className="navbar-end sm: pr-12 md:pr-2 gap-2">
        <Dark></Dark>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            {user ? (
              <div className="w-10 rounded-full">
                <img
                  alt="User avatar"
                  src="https://i.ibb.co.com/4PffJnR/photo-2023-02-28-19-26-32-2.jpg"
                />
              </div>
            ) : (
              <NavLink to="/login">{user ? "" : <a className="btn btn-sm">Login</a>}</NavLink>
            )}
          </div>

          {user ? (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-56"
            >
              <li className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm md:text-base">{user?.displayName || user?.email}</div>
                    <div className="text-xs opacity-70">{user?.email}</div>
                  </div>
                  {role ? <span className={`badge ${roleUi.badge}`}>{`${roleUi.icon} ${role}`}</span> : null}
                </div>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleGoToDashboard} disabled={resolving}>
                  {resolving ? "Opening..." : "Dashboard"}
                </button>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleLogOut}>Logout</button>
              </li>
            </ul>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
