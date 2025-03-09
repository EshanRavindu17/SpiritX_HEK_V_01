// src/App.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import Register from './pages/Register';
import store from '../context/store'; // Ensure this path is correct
import { Provider } from 'react-redux'; // Should now resolve after installation

function App() {
  return (
    <Provider store={store}> {/* Wrap your entire app with Redux Provider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} /> {/* Splash as root */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          {/* Add other routes as needed */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;