import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonation from './pages/donor/CreateDonation';
import MyDonations from './pages/donor/MyDonations';
import DonorHistory from './pages/donor/DonorHistory';

import NgoDashboard from './pages/ngo/NgoDashboard';
import AvailableDonations from './pages/ngo/AvailableDonations';
import DonationDetails from './pages/ngo/DonationDetails';
import NgoHistory from './pages/ngo/NgoHistory';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDonations from './pages/admin/ManageDonations';
import PlatformStats from './pages/admin/PlatformStats';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Donor Protected Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DONOR']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/create"
            element={
              <ProtectedRoute allowedRoles={['DONOR']}>
                <CreateDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donations"
            element={
              <ProtectedRoute allowedRoles={['DONOR']}>
                <MyDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/history"
            element={
              <ProtectedRoute allowedRoles={['DONOR']}>
                <DonorHistory />
              </ProtectedRoute>
            }
          />

          {/* NGO Protected Routes */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/available"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <AvailableDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/donations/:id"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <DonationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/history"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoHistory />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PlatformStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PlatformStats />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}