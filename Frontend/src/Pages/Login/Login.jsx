import { useState } from "react";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";
import { FaGithub, FaGoogle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UseAuth from "../../Hooks/UseAuth";

const Login = () => {
  const { logIn, googleSignIn, gitHubSignIn } = UseAuth();
  const [showPass, setShowPass] = useState(false);

  const location = useLocation();
  const nevigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const mail = form.get("email");
    const pass = form.get("password");

    // Loggingin With The Function Calling
    logIn(mail, pass)
      .then(() => {
        // toast.success("Login Successfully");
        e.target.reset();
        nevigate(location?.state ? location.state : "/");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Please Register First");
      });
  };
  const handleGoogleSignIn = () => {
    toast.success("Please Wait");
    googleSignIn()
      .then(() => {
        // toast.success("Login With Google Successfully");
        nevigate(location?.state ? location.state : "/");
      })

      .catch((error) => {
        console.error(error);
      });
  };

  const handleGitHubSignIn = () => {
    toast.success("Please Wait");
    gitHubSignIn()
      .then(() => {
        // toast.success("Login With gitHub Successfully");
        nevigate(location?.state ? location.state : "/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Signin"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <div className="md:flex justify-center md:min-h-screen">
        <div className="hero-content mt-16">
          <div className="flex-col w-[600px]">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Welcome Back </h2>
              <p className="font-base pt-2">
                Enter Your Credintial To Access Your Accout
              </p>
            </div>
            <div className="card shrink-0 w-full  shadow-2xl bg-base-100">
              <form onSubmit={handleLogin} className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Your Email"
                    className="input input-bordered"
                    required
                  />
                </div>
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative form-control ">
                  <input
                    className="input input-bordered"
                    placeholder="Password"
                    type={showPass ? "text" : "password"}
                    name="password"
                    id=""
                    required
                  />
                  <p
                    className="absolute top-4 right-2"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FaRegEye /> : <FaRegEyeSlash />}
                  </p>
                </div>
                <div className="form-control mt-6">
                  <button className="btn  bg-black text-white">Sign In</button>
                </div>
              </form>
              <div className="divider">OR</div>

              <div className="flex gap-4 justify-center mb-6 ">
                <button
                  onClick={handleGoogleSignIn}
                  className="btn btn-outline"
                >
                  <FaGoogle className="text-3xl"></FaGoogle>Google
                </button>
                <button
                  onClick={handleGitHubSignIn}
                  className="btn btn-outline "
                >
                  <FaGithub className="text-3xl"></FaGithub>Github
                </button>
              </div>
              <p className="pb-6 mx-auto">
                Do not have an Account?{" "}
                <NavLink to="/register" className="font-semibold text-blue-600">
                  Signup
                </NavLink>
              </p>
            </div>
          </div>
        </div>
        <div>
          <img
            className="md: max-h-[700px] md:min-w-[600px] md:my-24"
            src="https://i.ibb.co.com/dwC57Zzg/markus-frieauff-IJ0-Ki-Xl4uys-unsplash.jpg"
            alt=""
          />
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
};

export default Login;
