import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
