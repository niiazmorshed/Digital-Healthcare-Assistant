import { Link, NavLink } from "react-router-dom";
import "./nav.css";
// import toast from "react-hot-toast";
import UseAuth from "../../Hooks/UseAuth";
import Dark from "../../Dark Mode/Dark";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logOut } = UseAuth();

  const handleLogOut = () => {
    logOut()
      .then(() => {
        toast.success("Logout Successfully");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const navLinks = (
    <>
      <NavLink to="/">
        {" "}
        <li>
          <a className="text-white text-base font-semibold">Home</a>
        </li>
      </NavLink>
      <NavLink to="/doctors">
        {" "}
        <li>
          <a className="text-white text-base font-semibold">Doctors</a>
        </li>
      </NavLink>
      <NavLink to="/review">
        {" "}
        <li>
          <a className="text-white text-base font-semibold">Review</a>
        </li>
      </NavLink>
      <NavLink to="/aboutus">
        {" "}
        <li>
          <a className="text-white text-base font-semibold">About Us</a>
        </li>
      </NavLink>
    </>
  );
  return (
    <div className="navbar fixed bg-gray-800 z-10 top-0">
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
          <h1 className="text-5xl font-bold">
            <span className="text-white">Digital</span>{" "}
            <span className="text-blue-500">Healthcare</span>
          </h1>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navLinks}</ul>
      </div>

      <div className="navbar-end sm: pr-12 md:pr-2">
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
                  alt="Tailwind CSS Navbar component"
                  src="https://i.ibb.co.com/4PffJnR/photo-2023-02-28-19-26-32-2.jpg"
                />
              </div>
            ) : (
              <NavLink to="/login">
                {user ? "" : <a className="btn">Login</a>}
              </NavLink>
            )}
          </div>

          {user ? (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a className="justify-between">{user?.email}</a>
              </li>

              {user ? (
                <li>
                  <button onClick={handleLogOut}>Logout</button>
                </li>
              ) : (
                ""
              )}
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
