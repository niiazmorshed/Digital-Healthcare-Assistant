import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { A11y, EffectFade, Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
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

      // First, try to get role from userData (which might already be available)
      if (userData?.role) {
        if (!cancelled) {
          setRole(userData.role);
          console.log("Role from userData:", userData.role);
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
            console.log("Role fetched from API:", res.data.role);
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
              console.log("Role fetched from cache:", parsed.role);
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

  // Only show "Find Doctors" button for patients or unauthenticated users
  const shouldShowFindDoctorsButton = role === "patient" || (!user && !roleLoading);
  
  // Debug logs
  console.log("Current user:", user?.email);
  console.log("Current role:", role);
  console.log("Role loading:", roleLoading);
  console.log("Should show button:", shouldShowFindDoctorsButton);
  return (
    <Swiper
      modules={[Navigation, Scrollbar, A11y, EffectFade]}
      spaceBetween={50}
      slidesPerView={1}
      effect="fade"
      navigation
      scrollbar={{ draggable: true }}
      autoplay={{delay: 1500}}
    >
      <SwiperSlide>
        <section className="banner1">
          <section className="pt-32">
            <div className="md: flex flex-col justify-center text-center items-center gap-6 md:pt-6 min-h-screen">
              <div className="animate__animated animate__lightSpeedInLeft flex gap-6">
                {shouldShowFindDoctorsButton && (
                  <NavLink to="/doctors">
                    {" "}
                    <button className="btn btn-outline text-white">Find Doctors</button>
                  </NavLink>
                )}
              </div>
            </div>
          </section>
        </section>
      </SwiperSlide>
    </Swiper>
  );
};

export default Bannner;
