import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { Helmet } from "react-helmet";
import toast, { Toaster } from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
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
      const firstName = form.get("name");
      const lastName = form.get("lastName") || "";
      const photo = form.get("photo") || "";
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

      // Step 2: Update Firebase profile with display name and photo
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`.trim(),
        photoURL: photo,
      });

      // Step 3: Handle user authentication with backend (will register with correct role)
      const userData = await handleUserAuth(firebaseUser);

      // Step 4: If a photo is available, upsert to users collection
      try {
        const photoURL = firebaseUser?.photoURL || photo;
        if (photoURL) {
          await userAPI.updateProfile(firebaseUser.uid, { photoURL });
        }
      } catch (e2) {
        console.debug("Skipping photo upsert:", e2?.message || e2);
      }

      // Success
      e.target.reset();
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
      <div className="md:flex justify-center min-h-screen">
        <div className="hero-content mt-16">
          <div className="flex-col md:w-[600px]">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Welcome To </h2>
              <h1 className="text-5xl font-bold">
                <span className="text-black">Digital</span>{" "}
                <span className="text-blue-500">Healthcare</span>
              </h1>
              <p className="font-base pt-2">
                Signup to access our healthcare services
              </p>
            </div>
            <div className="card shrink-0 md:w-full  shadow-2xl bg-base-100">
              <form onSubmit={handleRegister} className="card-body">
                <div className="md:flex md:gap-6">
                  {/*First Name */}
                  <div className="form-control md:w-full">
                    <label className="label">
                      <span className="label-text">First Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter Your First Name"
                      className="input input-bordered"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="form-control md:w-full">
                    <label className="label">
                      <span className="label-text">Last Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter Your Last Name"
                      className="input input-bordered"
                    />
                  </div>
                </div>

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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Profile Photo URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    name="photo"
                    placeholder="https://example.com/photo.jpg"
                    className="input input-bordered"
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </div>
              </form>
              <div className="divider">OR</div>

              <p className="pb-6 mx-auto">
                Already Have an Account?{" "}
                <NavLink to="/login" className="font-semibold text-blue-600">
                  SignIn
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

export default Register;
