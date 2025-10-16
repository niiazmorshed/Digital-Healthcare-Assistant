import { useState } from "react";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";
import { FaGithub, FaGoogle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UseAuth from "../../Hooks/UseAuth";
import { userAPI } from "../../services/api";

const Login = () => {
  const { logIn, googleSignIn, gitHubSignIn, handleUserAuth } = UseAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const maybeUpsertPhoto = async (firebaseUser) => {
    try {
      const url = firebaseUser?.photoURL || firebaseUser?.providerData?.[0]?.photoURL;
      if (!url) return; // nothing to store
      await userAPI.updateProfile(firebaseUser.uid, { photoURL: url });
    } catch (e) {
      // Non-blocking
      console.debug("Skipping photo upsert:", e?.message || e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const mail = form.get("email");
      const pass = form.get("password");

      if (!mail || !pass) {
        toast.error("Please enter email and password.");
        return;
      }

      // Step 1: Login with Firebase Authentication
      const userCredential = await logIn(mail, pass);
      const firebaseUser = userCredential.user;

      // Step 2: Handle user authentication with backend (login or register)
      await handleUserAuth(firebaseUser);
      await maybeUpsertPhoto(firebaseUser);

      // Success
      e.target.reset();
      toast.success("Login successful. Welcome back!");
      navigate(location?.state ? location.state : "/");

    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error.code === "auth/user-not-found" ? "User not found. Please register first." :
        error.code === "auth/wrong-password" ? "Incorrect password. Please try again." :
        error.code === "auth/invalid-email" ? "Invalid email. Please enter a valid email." :
        error.code === "auth/too-many-requests" ? "Too many attempts. Try again later." :
        error.response?.status === 404 ? "User not found in database. Please register." :
        error.response?.status === 400 ? "Invalid login data." :
        "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    toast.loading("Signing in with Google...", { id: "oauth" });

    try {
      const userCredential = await googleSignIn();
      const firebaseUser = userCredential.user;
      await handleUserAuth(firebaseUser);
      await maybeUpsertPhoto(firebaseUser);
      toast.success("Google sign-in successful!", { id: "oauth" });
      navigate(location?.state ? location.state : "/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.", { id: "oauth" });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    toast.loading("Signing in with GitHub...", { id: "oauth" });

    try {
      const userCredential = await gitHubSignIn();
      const firebaseUser = userCredential.user;
      await handleUserAuth(firebaseUser);
      await maybeUpsertPhoto(firebaseUser);
      toast.success("GitHub sign-in successful!", { id: "oauth" });
      navigate(location?.state ? location.state : "/");
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      toast.error("GitHub sign-in failed. Please try again.", { id: "oauth" });
    } finally {
      setLoading(false);
    }
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
                Enter Your Credentials To Access Your Account
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
                    required
                  />
                  <p
                    className="absolute top-4 right-2 cursor-pointer"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FaRegEye /> : <FaRegEyeSlash />}
                  </p>
                </div>
                <div className="form-control mt-6">
                  <button 
                    className={`btn bg-black text-white ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>
              <div className="divider">OR</div>

              <div className="flex gap-4 justify-center mb-6 ">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`btn btn-outline ${loading ? 'loading' : ''}`}
                >
                  <FaGoogle className="text-3xl"></FaGoogle>Google
                </button>
                <button
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  className={`btn btn-outline ${loading ? 'loading' : ''}`}
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
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
};

export default Login;
