import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
import Navbar from "../Pages/Navbar/Navbar";

const Roots = () => {
  const location = useLocation();
  const showFooter = location.pathname === "/doctors";
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  return (
    <div>
      {hideNavbar ? null : <Navbar />}
      <div className="font-nunito">
        <Outlet></Outlet>
      </div>
      {showFooter ? <Footer /> : null}
    </div>
  );
};

export default Roots;
