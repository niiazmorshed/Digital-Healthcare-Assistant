import { createBrowserRouter } from "react-router-dom";
import Roots from "../Layout/Roots";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Review from "../Our Review/Review";
import AboutUs from "../About Us/AboutUs";
import Error from "../Error/Error";
import Doctors from "../Pages/Doctors/Doctors";
// import Doctors from "../Pages/Doctors/Doctors";

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
        path: "/review",
        element: <Review />,
      },
      {
        path: "/aboutus",
        element: <AboutUs />,
      },
      {
        path : "/doctors",
        element : <Doctors></Doctors>
      }
    ],
  },
]);

export default router;