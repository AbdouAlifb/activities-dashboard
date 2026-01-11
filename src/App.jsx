import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import MenuManagementPage from './pages/MenuManagementPage';
import NotFoundPage from './pages/NotFoundPage';

// Platform Pages (Super Admin)
import CountriesPage from './pages/CountriesPage';
import CitiesPage from './pages/CitiesPage';
import CategoriesPage from './pages/CategoriesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AgenciesPage from './pages/AgenciesPage';
import ReservationsPage from './pages/ReservationsPage';
import AgencyPayoutsPage from './pages/AgencyPayoutsPage';

// Agency Pages
import AgencyDashboardPage from './pages/AgencyDashboardPage';
import AgencyReservationsPage from './pages/AgencyReservationsPage';

import {
  KpisOverviewPage,
  KpisEditPage,
  MonthlyReportsPage,
  AnnualReportsPage,
  ViewClaimsPage,
  ProcessClaimsPage,
} from './pages/PlaceholderPages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/payouts" element={<ProtectedRoute requireSuperAdmin><AgencyPayoutsPage /></ProtectedRoute>} />

            {/* KPIs */}
            <Route path="kpis/overview" element={<KpisOverviewPage />} />
            <Route path="kpis/edit" element={<KpisEditPage />} />
            
            {/* Reports */}
            <Route path="reports/monthly" element={<MonthlyReportsPage />} />
            <Route path="reports/annual" element={<AnnualReportsPage />} />
            
            {/* Claims */}
            <Route path="claims/view" element={<ViewClaimsPage />} />
            <Route path="claims/process" element={<ProcessClaimsPage />} />
            
            {/* Platform Management - Super Admin only */}
            <Route path="platform/countries" element={<ProtectedRoute requireSuperAdmin><CountriesPage /></ProtectedRoute>} />
            <Route path="platform/cities" element={<ProtectedRoute requireSuperAdmin><CitiesPage /></ProtectedRoute>} />
            <Route path="platform/categories" element={<ProtectedRoute requireSuperAdmin><CategoriesPage /></ProtectedRoute>} />
            <Route path="platform/activities" element={<ProtectedRoute requireSuperAdmin><ActivitiesPage /></ProtectedRoute>} />
            <Route path="platform/agencies" element={<ProtectedRoute requireSuperAdmin><AgenciesPage /></ProtectedRoute>} />
            <Route path="platform/reservations" element={<ProtectedRoute requireSuperAdmin><ReservationsPage /></ProtectedRoute>} />
            
            {/* Agency Admin routes */}
            <Route path="agency/dashboard" element={<AgencyDashboardPage />} />
            <Route path="agency/activities" element={<AgencyDashboardPage />} />
            <Route path="agency/reservations" element={<AgencyReservationsPage />} />
            <Route path="agency/profile" element={<AgencyDashboardPage />} />
            
            {/* Admin routes - Super Admin only */}
            <Route path="admin/users" element={<ProtectedRoute requireSuperAdmin><UserManagementPage /></ProtectedRoute>} />
            <Route path="admin/roles" element={<ProtectedRoute requireSuperAdmin><RoleManagementPage /></ProtectedRoute>} />
            <Route path="admin/menus" element={<ProtectedRoute requireSuperAdmin><MenuManagementPage /></ProtectedRoute>} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
