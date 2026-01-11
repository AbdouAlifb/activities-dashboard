import React from 'react';

const Card = ({ children, className = '', padding = 'md' }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-display font-semibold text-lg text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 mt-1 ${className}`}>
    {children}
  </p>
);

export default Card;
