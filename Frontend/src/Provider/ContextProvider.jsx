import {
    GithubAuthProvider,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import auth from "../Firebase/firebase.config";
import { userAPI } from "../services/api";

export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const gitHubProvider = new GithubAuthProvider();

// Doctor email list for role detection
const DOCTOR_EMAILS = [
  'fahim@healthcare.com',
  'sakib@healthcare.com', 
  'samia@healthcare.com',
  'labib@healthcare.com'
];

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Store user data from database
  const [loading, setLoading] = useState(true);

  // Function to handle user authentication with backend (login or register)
  const handleUserAuth = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserData(null);
      return null;
    }

    try {
      // First try to login
      const loginResponse = await userAPI.login(firebaseUser.uid, firebaseUser.email);
      if (loginResponse.success) {
        setUserData(loginResponse.data);
        return loginResponse.data;
      }
    } catch (error) {
      // User doesn't exist, register them
      try {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          // Role will be automatically determined by backend based on email
        };

        const registerResponse = await userAPI.register(userData);
        if (registerResponse.success) {
          setUserData(registerResponse.data);
          return registerResponse.data;
        }
      } catch (registerError) {
        console.error('Error registering user:', registerError);
        throw registerError;
      }
    }
  };

  // Function to fetch user data from database
  const fetchUserData = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserData(null);
      return;
    }

    try {
      await handleUserAuth(firebaseUser);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Creating The Function Of The USER
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login Function
  const logIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google SignIn
  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  //   Github Signin
  const gitHubSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, gitHubProvider);
  };

  // Logout Function
  const logOut = () => {
    setLoading(true);
    setUserData(null);
    return signOut(auth);
  };

  // Function to register user in database
  const registerUserInDB = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      if (response.success) {
        setUserData(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Function to login user in database
  const loginUserInDB = async (uid, email) => {
    try {
      const response = await userAPI.login(uid, email);
      if (response.success) {
        setUserData(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Function to update user profile
  const updateUserProfile = async (uid, updateData) => {
    try {
      const response = await userAPI.updateProfile(uid, updateData);
      if (response.success) {
        setUserData(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("User in the auth state changed-", currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        // Handle user authentication with backend
        await fetchUserData(currentUser);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    return () => {
      unSubscribe();
    };
  }, []);

  const authInfo = {
    user,
    userData, // User data from database
    createUser,
    logIn,
    logOut,
    loading,
    googleSignIn,
    gitHubSignIn,
    registerUserInDB,
    loginUserInDB,
    updateUserProfile,
    fetchUserData,
    handleUserAuth,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default ContextProvider;
ContextProvider.propTypes = {
  children: PropTypes.node,
};
