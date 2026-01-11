import React, { useState, useEffect, createContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useReservationNotifications } from '../hooks/useReservationNotifications';

// Page title mapping
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/kpis/overview': 'KPIs Overview',
  '/kpis/edit': 'KPIs Edit',
  '/reports/monthly': 'Monthly Reports',
  '/reports/annual': 'Annual Reports',
  '/claims/view': 'View Claims',
  '/claims/process': 'Process Claims',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/menus': 'Menu Management',
};

// Create context for notifications
export const NotificationsContext = createContext({
  hasNewReservations: false,
  newReservationsCount: 0,
  markAsSeen: () => {}
});

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  // Get user role from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.roleName);
  }, []);

  // Use notification hook
  const { hasNewReservations, newReservationsCount, markAsSeen } = useReservationNotifications(userRole);

  // Mark notifications as seen when user visits reservation pages
  useEffect(() => {
    if (location.pathname.includes('reservation')) {
      markAsSeen();
    }
  }, [location.pathname, markAsSeen]);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <NotificationsContext.Provider value={{ hasNewReservations, newReservationsCount, markAsSeen }}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          hasNewReservations={hasNewReservations}
          newReservationsCount={newReservationsCount}
        />

        {/* Main content area */}
        <div className="lg:pl-64 min-h-screen transition-all duration-300">
          <Header onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />

          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsContext.Provider>
  );
};

export default DashboardLayout;
