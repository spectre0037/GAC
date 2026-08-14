import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  [
    // Typography
    'text-[10px]',
    'font-semibold',
    'uppercase',
    'tracking-[0.18em]',
    'text-slate-500',

    // Layout
    'leading-none',

    // Disabled state
    'peer-disabled:cursor-not-allowed',
    'peer-disabled:opacity-70',
  ].join(' ')
);

const Label = React.forwardRef(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };