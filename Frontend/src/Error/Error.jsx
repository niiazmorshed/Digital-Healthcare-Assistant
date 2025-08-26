import { NavLink } from "react-router-dom";
import Lottie from "lottie-react";
import error from "../../public/error.json";
import { Helmet } from "react-helmet";

const Error = () => {
    return (
        <div className="flex flex-col justify-center items-center">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Error"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
        <NavLink to="/">
          <button className="mt-12 text-xl btn btn-outline">
            Back To Home
          </button>
        </NavLink>
        <div className="w-[1000px]">
          <Lottie animationData={error} loop={true}></Lottie>
        </div>
      </div>
    );
};

export default Error;