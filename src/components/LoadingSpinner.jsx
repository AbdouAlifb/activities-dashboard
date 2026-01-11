import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
