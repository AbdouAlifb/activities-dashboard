import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Edit,
  FileText,
  Calendar,
  CalendarDays,
  FileCheck,
  Eye,
  CheckCircle,
  Settings,
  Users,
  Shield,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Globe,
  MapPin,
  Building2,
  Tags,
  Compass,
  Store,
  CalendarCheck,
  Building,
  Landmark,
  ChefHat,
  Waves,
  Mountain,
  Sparkles,
  Car,
  Camera,
  DollarSign,
} from 'lucide-react';

// Icon mapping
const iconMap = {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Edit,
  FileText,
  Calendar,
  CalendarDays,
  FileCheck,
  Eye,
  CheckCircle,
  Settings,
  Users,
  Shield,
  Menu,
  Globe,
  MapPin,
  Building2,
  Tags,
  Compass,
  Store,
  CalendarCheck,
  Building,
  Landmark,
  ChefHat,
  Waves,
  Mountain,
  Sparkles,
  Car,
  Camera,
  DollarSign,
};

const getIcon = (iconName) => {
  return iconMap[iconName] || LayoutDashboard;
};

const MenuItem = ({ item, isCollapsed, hasNewReservations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const Icon = getIcon(item.icon);

  // Check if this is a reservations-related menu item
  const isReservationItem = item.path?.includes('reservation') || item.name?.toLowerCase().includes('reservation');

  // Check if this item or any child is active
  const isActive = item.path === location.pathname;
  const isChildActive = hasChildren && item.children.some(child => child.path === location.pathname);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isChildActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <div className="flex items-center gap-3 relative">
            <Icon className={`w-5 h-5 ${isChildActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {!isCollapsed && (
              <>
                <span className="font-medium text-sm">{item.name}</span>
                {isReservationItem && hasNewReservations && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </>
            )}
          </div>
          {!isCollapsed && (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isOpen && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
            {item.children.map((child) => (
              <MenuItem key={child.id} item={child} isCollapsed={isCollapsed} hasNewReservations={hasNewReservations} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path || '#'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1 relative
        ${isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
      {!isCollapsed && (
        <>
          <span className="font-medium text-sm">{item.name}</span>
          {isReservationItem && hasNewReservations && !isActive && (
            <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose, hasNewReservations, newReservationsCount }) => {
  const { menu, user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="CardND"
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><text x="5" y="25" font-family="Arial" font-size="18" fill="%23047857">CardND</text></svg>';
                }}
              />
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menu.map((item) => (
              <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} hasNewReservations={hasNewReservations} />
            ))}
          </div>
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-slate-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-3`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.roleName}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
