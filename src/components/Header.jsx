import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h1 className="font-display font-semibold text-xl text-slate-900">{title}</h1>
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400 w-48"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User avatar - visible on mobile */}
        <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
