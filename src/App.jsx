import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundDecoration from './components/BackgroundDecoration';
import SplashScreen from './components/SplashScreen';

import Home from './pages/Home';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import ReportItem from './pages/ReportItem';
import Dashboard from './pages/Dashboard';
import MyClaims from './pages/MyClaims';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Safely initialize Capacitor Native UI when running on Android
    const initCapacitor = async () => {
      try {
        if (window?.Capacitor?.isNativePlatform?.()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          const { SplashScreen: CapSplashScreen } = await import('@capacitor/splash-screen');

          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#FAF9F6' });
          await CapSplashScreen.hide();
        }
      } catch (err) {
        // Ignore in standard web browser
      }
    };
    initCapacitor();
  }, []);

  return (
    <div className="app-container">
      {/* Animated App Splash Screen on initial boot */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <BackgroundDecoration />
      <Navbar />

      <main className="main-content">
        <div key={location.pathname} className="page-transition-wrapper">
          <Routes location={location}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

