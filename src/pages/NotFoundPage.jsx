import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-9xl font-display font-bold text-slate-200">404</h1>
        <h2 className="text-2xl font-display font-semibold text-slate-900 -mt-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button icon={Home}>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
