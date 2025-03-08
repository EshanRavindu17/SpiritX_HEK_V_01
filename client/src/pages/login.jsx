import React, { useState } from 'react';
import Image from 'next/image';
import logo from '../assets/images/transparentlogo.png';
import Link from 'next/link';

import { firebaseAuth, signInWithEmailAndPassword } from '../config/firebase'; // Import Firebase firebaseAuth methods
import { useRouter } from 'next/router';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(firebaseAuth, username, password);
      console.log('Login successful');
      router.push('/grouppages'); 
    } catch (error) {
      setError('Invalid username or password');
      console.log('Login failed', error.message);
    }
  };

  const handleRegisterClick = () => {
    router.push('/register'); // Navigate to register page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        {/* Logo and "myPOL" (aligned vertically) */}
        <div className="flex items-center justify-center mb-6">
          <Image src={logo} alt="Logo" width={40} height={40} className="mr-2" />
          <h2 className="text-3xl font-bold text-primary">myPOL</h2>
        </div>

        <p className="text-sm text-gray-600 mb-8 text-center">For better studying...</p>

        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-accent">E-mail</label>
          <input
            type="text"
            id="e-mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Password Field */}
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
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleLogin}
          className="relative w-full py-2 rounded-md text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition duration-300 ease-in-out border-2 border-orange-500 shadow-lg transform hover:scale-105"
        >
          <span className="absolute inset-0 bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-md"></span>
          <span className="relative z-10">Login</span>
        </button>

        {/* Register Link */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account? 
          <Link href="/register">
            <t className="ml-2 text-gray-600 font-semibold transition duration-300 ease-in-out cursor-pointer transform hover:text-orange-500 hover:scale-110 hover:translate-y-[-2px]">
              Register Here
            </t>
          </Link>
        </p>
      </form>
    </div>
  );
}
Login.getLayout = (page) => page; // Just return the page itself without a layout

export default Login;
