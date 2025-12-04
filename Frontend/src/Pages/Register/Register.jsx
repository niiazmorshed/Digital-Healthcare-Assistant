import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Dark from "../../Dark Mode/Dark";
import UseAuth from "../../Hooks/UseAuth";
import { userAPI } from "../../services/api";

const Register = () => {
  const { createUser, handleUserAuth } = UseAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const fullName = (form.get("name") || "").toString().trim();
      const email = form.get("email");
      const pass = form.get("password");

      // Checking The Password requirements
      if (pass.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      } else if (!/[A-Z]/.test(pass)) {
        toast.error("Password must include an uppercase letter.");
        return;
      } else if (!/[a-z]/.test(pass)) {
        toast.error("Password must include a lowercase letter.");
        return;
      }

      // Step 1: Create user with Firebase Authentication
      const userCredential = await createUser(email, pass);
      const firebaseUser = userCredential.user;

      // Step 2: Update Firebase profile with display name
      await updateProfile(firebaseUser, {
        displayName: fullName,
      });

      // Ensure the local object has latest name prior to backend call
      try {
        if (!firebaseUser.displayName && fullName) {
          firebaseUser.displayName = fullName;
        }
      } catch {}

      // Step 3: Handle user authentication with backend (will register with correct role)
      const userData = await handleUserAuth(firebaseUser);

      // Step 4: If a photo is available (from providers later), upsert to users collection (non-blocking)
      try {
        const photoURL = firebaseUser?.photoURL || firebaseUser?.providerData?.[0]?.photoURL;
        if (photoURL) {
          await userAPI.updateProfile(firebaseUser.uid, { photoURL });
        }
      } catch (e2) {
        console.debug("Skipping photo upsert:", e2?.message || e2);
      }

      // Success
      e.target.reset();
      const firstName = fullName.split(" ")[0] || "";
      const welcomeMessage = userData?.role === 'doctor' 
        ? `Welcome Dr. ${firstName}! Registration successful!`
        : `Welcome ${firstName}! Registration successful!`;
      toast.success(welcomeMessage);
      navigate("/");

    } catch (error) {
      console.error("Registration error:", error);
      const msg =
        error.code === "auth/email-already-in-use" ? "This email is already registered. Please log in." :
        error.code === "auth/weak-password" ? "Password is too weak." :
        error.code === "auth/invalid-email" ? "Invalid email address." :
        error.response?.status === 409 ? "User already exists in our database." :
        error.response?.status === 400 ? "Invalid registration data." :
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Signup"} | Digital Healthcare</title>
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
              <h2 className="text-4xl font-extrabold">Join Us Today</h2>
              <p className="mt-1 opacity-70">Create your account and start caring</p>
            </div>
            <div className="card md:w-full shadow-xl bg-base-100">
              <form onSubmit={handleRegister} className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="input input-bordered focus:input-primary"
                    required
                  />
                </div>

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
                    placeholder="Create a strong password"
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
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters with uppercase and lowercase letters</p>
                <div className="form-control mt-6">
                  <button 
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>
              <div className="divider">OR</div>

              <p className="pb-6 text-center">
                Already have an account?{" "}
                <NavLink to="/login" className="font-semibold text-primary">
                  Sign in here
                </NavLink>
              </p>
            </div>
          </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
};

export default Register;
