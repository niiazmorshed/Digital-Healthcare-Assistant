import { useState } from "react";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";
import { FaGithub, FaGoogle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Dark from "../../Dark Mode/Dark";
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
      const msg = error?.code === 'auth/popup-closed-by-user'
        ? 'Google sign-in popup closed.'
        : error?.code === 'auth/popup-blocked'
        ? 'Popup was blocked. Please allow popups for this site.'
        : error?.code === 'auth/unauthorized-domain'
        ? 'Unauthorized domain in Firebase. Add your domain in Firebase console.'
        : error?.message || 'Google sign-in failed. Please try again.';
      toast.error(msg, { id: "oauth" });
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
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-base-200 to-base-100 dark:from-base-300 dark:to-base-200">
        <div className="absolute left-4 top-4">
          <Link to="/" className="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
        </div>
        <div className="absolute right-4 top-4"><Dark /></div>
        <div className="w-full max-w-xl px-4">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-extrabold">Welcome Back</h2>
              <p className="mt-1 opacity-70">Sign in to continue your healthcare journey</p>
            </div>
            <div className="card shadow-xl bg-base-100">
              <form onSubmit={handleLogin} className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative form-control">
                  <input
                    className="input input-bordered pr-10 focus:input-primary"
                    placeholder="Enter your password"
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
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>
              <div className="divider m-0">OR continue with</div>
              <div className="flex gap-3 justify-center px-6 pb-6 pt-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`btn btn-outline ${loading ? 'loading' : ''}`}
                >
                  <FaGoogle className="text-xl" /> Google
                </button>
                <button
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  className={`btn btn-outline ${loading ? 'loading' : ''}`}
                >
                  <FaGithub className="text-xl" /> Github
                </button>
              </div>
              <p className="pb-6 text-center">
                Don't have an account? {""}
                <NavLink to="/register" className="font-semibold text-primary">
                  Sign up here
                </NavLink>
              </p>
            </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default Login;
