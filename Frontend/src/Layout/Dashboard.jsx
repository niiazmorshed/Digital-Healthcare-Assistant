import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import UseAuth from '../Hooks/UseAuth';

const Dashboard = () => {
  const { user, userData } = UseAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    
    const initializeDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Wait for userData to be loaded
      if (!userData) {
        // Still loading user data
        return;
      }

      if (!cancelled) {
        setLoading(false);
        
        // Redirect to appropriate dashboard based on role
        if (userData.role === 'doctor') {
          navigate('/dashboard/doctor');
        } else if (userData.role === 'patient') {
          navigate('/dashboard/patient');
        } else if (userData.role === 'admin') {
          // Admin can access both, default to patient panel
          navigate('/dashboard/patient');
        }
      }
    };

    initializeDashboard();
    
    return () => {
      cancelled = true;
    };
  }, [user, userData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 md:px-8 flex justify-center items-center">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 lg:col-span-2 bg-base-200 rounded-xl p-4 h-max sticky top-24">
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <nav className="flex flex-col gap-2">
            {userData?.role === 'patient' && (
              <NavLink
                to="/dashboard/patient"
                className={({ isActive }) =>
                  `btn btn-sm justify-start ${isActive ? 'btn-primary' : 'btn-ghost'}`
                }
              >
                Patient Panel
              </NavLink>
            )}
            {userData?.role === 'doctor' && (
              <NavLink
                to="/dashboard/doctor"
                className={({ isActive }) =>
                  `btn btn-sm justify-start ${isActive ? 'btn-primary' : 'btn-ghost'}`
                }
              >
                Doctor Panel
              </NavLink>
            )}
            {userData?.role === 'admin' && (
              <>
                <NavLink
                  to="/dashboard/patient"
                  className={({ isActive }) =>
                    `btn btn-sm justify-start ${isActive ? 'btn-primary' : 'btn-ghost'}`
                  }
                >
                  Patient Panel
                </NavLink>
                <NavLink
                  to="/dashboard/doctor"
                  className={({ isActive }) =>
                    `btn btn-sm justify-start ${isActive ? 'btn-primary' : 'btn-ghost'}`
                  }
                >
                  Doctor Panel
                </NavLink>
              </>
            )}
            {!userData?.role && (
              <div className="text-sm opacity-70">Loading role...</div>
            )}
          </nav>
        </aside>

        <main className="md:col-span-9 lg:col-span-10">
          <div className="bg-base-100 rounded-xl p-4 md:p-6 shadow">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;