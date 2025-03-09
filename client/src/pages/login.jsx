import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Changed to React Router DOM
import { firebaseAuth, signInWithEmailAndPassword } from '../config/firebaseConfig'; // Adjust path as needed
import { useDispatch } from "react-redux";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate(); // Changed from useRouter
  const dispatch = useDispatch();

  // Real-time validation
  useEffect(() => {
    validateUsername(username);
    validatePassword(password);
  }, [username, password]);

  const validateUsername = (value) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 8) {
      setUsernameError('Username must be at least 8 characters');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (!/[a-z]/.test(value)) {
      setPasswordError('Must contain a lowercase letter');
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Must contain an uppercase letter');
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(value)) {
      setPasswordError('Must contain a special character');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');

    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (!isUsernameValid || !isPasswordValid) {
      setAuthError('Please fix all errors before submitting');
      return;
    }

    try {
      const email = `${username}`; // Consistent with signup
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Session management
      sessionStorage.setItem("token", idToken);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("isLoggedIn", "true");
      const userData = {
        _id: user.uid,
        fullName: user.displayName || "User",
        username: user.email.split("@")[0], // Example: Extract username from email
        providerData: user.providerData,
      };

      // Dispatch user to Redux
      dispatch({ type: "SET_USER", payload: userData });
      navigate('/dashboard'); // Changed to use navigate
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
        setAuthError("Incorrect username or password");
      } else {
        setAuthError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96" onSubmit={handleLogin}>
      

        {authError && (
          <p className="text-red-600 text-sm mb-4 text-center">{authError}</p>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-accent">Email</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {usernameError && (
            <p className="text-red-600 text-sm mt-1">{usernameError}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-accent">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {passwordError && (
            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          className="relative w-full py-2 rounded-md text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition duration-300 ease-in-out border-2 border-orange-500 shadow-lg transform hover:scale-105"
        >
          <span className="relative z-10">Login</span>
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account? 
          <Link to="/register"> {/* Changed from href to to */}
            <span className="ml-2 text-gray-600 font-semibold transition duration-300 ease-in-out cursor-pointer transform hover:text-orange-500 hover:scale-110 hover:translate-y-[-2px]">
              Register Here
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const handleLogout = () => {
    sessionStorage.clear();
    firebaseAuth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (!sessionStorage.getItem("isLoggedIn")) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Hello, {username}!
        </h2>
        <p className="mt-4 text-center text-gray-600">Welcome to your dashboard</p>
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export { Login, Dashboard };