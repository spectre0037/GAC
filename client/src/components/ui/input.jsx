import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          // Base
          'flex w-full h-12 rounded-xl',
          
          // Typography
          'text-sm text-[#1A2B48]',
          
          // Background + border
          'bg-[#F4F7F7] border border-slate-200/70',
          
          // Spacing
          'px-4 py-2',
          
          // Placeholder
          'placeholder:text-slate-400',
          
          // Shadow
          'shadow-none',
          
          // Transition
          'transition-all duration-200',
          
          // Focus
          'focus:bg-white',
          'focus:border-[#3D6BB4]/30',
          'focus:outline-none',
          'focus:ring-4',
          'focus:ring-[#3D6BB4]/10',
          
          // Disabled
          'disabled:cursor-not-allowed',
          'disabled:opacity-50',
          'disabled:bg-slate-100',
          
          // File input
          'file:border-0',
          'file:bg-transparent',
          'file:text-sm',
          'file:font-medium',
          'file:text-[#1A2B48]',
          
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };