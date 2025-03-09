import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from '../../../client/config/firebaseConfig'; // Adjust path
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const Dashboard = () => {
  const [userName, setUserName] = useState("Guest"); // Default to "Guest"
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);
  
  // Get user data from Redux store
  const user = useSelector((state) => state.user); // Adjust based on your Redux state structure

  useEffect(() => {
    if (user && user.user) {
      console.log("User data from Redux:", user.user);
      // Set username from Redux, fallback to "Guest" if not available
      setUserName(user.user.username || "Guest");
      localStorage.getItem("user")
      console.log("userrrrr ",      localStorage.getItem("user")
    )
    } else {
      // Redirect to login if no user data in Redux
      navigate('/login');
    }
  }, [user, navigate]);

  // Firebase logout function
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        dispatch({ type: 'SET_USER_NULL' }); // Clear Redux user state
        navigate('/login');
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Welcome Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {userName}!
        </h1>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export { Dashboard };