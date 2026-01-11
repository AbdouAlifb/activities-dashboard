import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
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
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
