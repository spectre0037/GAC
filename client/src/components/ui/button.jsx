import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-xl text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[#3D6BB4]/20',
    'focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none',
    '[&_svg]:size-4',
    '[&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        /* =====================================================
           PRIMARY
        ====================================================== */
        default:
          'bg-[#1A2B48] text-white shadow-sm ' +
          'hover:bg-[#243A5D] ' +
          'hover:shadow-md',

        /* =====================================================
           DESTRUCTIVE
        ====================================================== */
        destructive:
          'bg-red-600 text-white shadow-sm ' +
          'hover:bg-red-700 ' +
          'hover:shadow-md ' +
          'focus-visible:ring-red-500/20',

        /* =====================================================
           OUTLINE
        ====================================================== */
        outline:
          'border border-slate-200/70 ' +
          'bg-white text-[#1A2B48] ' +
          'shadow-sm ring-1 ring-slate-200/30 ' +
          'hover:border-[#3D6BB4]/30 ' +
          'hover:bg-[#EBF2F2] ' +
          'hover:text-[#1A2B48]',

        /* =====================================================
           SECONDARY
        ====================================================== */
        secondary:
          'bg-[#EBF2F2] text-[#1A2B48] ' +
          'shadow-sm ' +
          'hover:bg-[#DDEAEA] ' +
          'hover:text-[#1A2B48]',

        /* =====================================================
           GHOST
        ====================================================== */
        ghost:
          'text-slate-600 ' +
          'hover:bg-[#EBF2F2] ' +
          'hover:text-[#1A2B48]',

        /* =====================================================
           LINK
        ====================================================== */
        link:
          'text-[#3D6BB4] ' +
          'underline-offset-4 ' +
          'hover:text-[#1A2B48] ' +
          'hover:underline',

        /* =====================================================
           ACCENT BLUE
        ====================================================== */
        accent:
          'bg-[#3D6BB4] text-white ' +
          'shadow-sm ' +
          'hover:bg-[#345D9D] ' +
          'hover:shadow-md',

        /* =====================================================
           SUCCESS
        ====================================================== */
        success:
          'bg-emerald-600 text-white ' +
          'shadow-sm ' +
          'hover:bg-emerald-700 ' +
          'hover:shadow-md ' +
          'focus-visible:ring-emerald-500/20',

        /* =====================================================
           WARNING
        ====================================================== */
        warning:
          'bg-amber-500 text-white ' +
          'shadow-sm ' +
          'hover:bg-amber-600 ' +
          'hover:shadow-md ' +
          'focus-visible:ring-amber-500/20',
      },

      size: {
        default:
          'h-10 px-4 py-2',

        sm:
          'h-9 rounded-xl px-3.5 text-xs',

        lg:
          'h-11 rounded-xl px-7',

        icon:
          'h-10 w-10 rounded-xl',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };