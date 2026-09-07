import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundDecoration from './components/BackgroundDecoration';

import Home from './pages/Home';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import ReportItem from './pages/ReportItem';
import Dashboard from './pages/Dashboard';
import MyClaims from './pages/MyClaims';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  useEffect(() => {
    // Safely initialize Capacitor Native UI when running on Android
    const initCapacitor = async () => {
      try {
        if (window?.Capacitor?.isNativePlatform?.()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          const { SplashScreen } = await import('@capacitor/splash-screen');
          
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#FAF9F6' });
          await SplashScreen.hide();
        }
      } catch (err) {
        // Ignore in standard web browser
      }
    };
    initCapacitor();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container">
            <BackgroundDecoration />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<BrowseItems />} />
                <Route path="/items/:id" element={<ItemDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <MyClaims />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
