import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Changed to React Router DOM
import { firebaseAuth, firestoreDB } from '../config/firebaseConfig'; // Import Firebase config
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { SET_USER } from '../../src/context/actions/userAction';

const Splash = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("here 0")
    const checkLoggedUser = async () => {
        firebaseAuth.onAuthStateChanged((userCred) => {
        if (userCred?.uid) {       
          getDoc(doc(firestoreDB, 'users', userCred?.uid)).then((docSnap) => {
            if (docSnap.exists()) {
              console.log("User data here:", docSnap.data());
              dispatch(SET_USER(docSnap.data())); // Dispatch user data to Redux store
            }
          }).then(() => {
            setTimeout(() => {
              console.log("here 1")
            navigate('/dashboard'); // Redirect to home after a delay
            }, 1000); // 1 second delay
          });
        } else {
          console.log("here 2")
          navigate('/login'); // Redirect to login if user is not logged in
        }
      });
    };

    checkLoggedUser(); // Call the function to check logged-in status
  }, [dispatch, navigate]);

  // Display loading spinner while checking user authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          <span className="text-xl text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return null; // No need to return anything after the navigation
};

export {Splash};
