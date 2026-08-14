import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    // Base
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap select-none',
    'rounded-xl',
    'text-sm font-medium',
    'transition-all duration-200 ease-out',

    // Interaction
    'outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-[#3D6BB4]/25',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[#EBF2F2]',

    // Disabled
    'disabled:pointer-events-none',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',

    // Press
    'active:scale-[0.98]',

    // SVG
    '[&_svg]:pointer-events-none',
    '[&_svg]:size-4',
    '[&_svg]:shrink-0',

    // Mobile
    'max-w-full',
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        /* =====================================================
           PRIMARY
        ====================================================== */
        default:
          [
            'bg-[#1A2B48]',
            'text-white',
            'shadow-sm',
            'border border-transparent',
            'hover:bg-[#243A5D]',
            'hover:shadow-md',
            'active:bg-[#16243C]',
          ].join(' '),

        /* =====================================================
           DESTRUCTIVE
        ====================================================== */
        destructive:
          [
            'bg-[#A34F4F]',
            'text-white',
            'shadow-sm',
            'border border-transparent',
            'hover:bg-[#8E3D3D]',
            'hover:shadow-md',
            'focus-visible:ring-red-500/25',
          ].join(' '),

        /* =====================================================
           OUTLINE
        ====================================================== */
        outline:
          [
            'border border-[#D8E4EC]',
            'bg-white',
            'text-[#1A2B48]',
            'shadow-sm',
            'hover:border-[#88B3D8]',
            'hover:bg-[#F4F8FA]',
            'hover:text-[#1A2B48]',
            'hover:shadow-sm',
          ].join(' '),

        /* =====================================================
           SECONDARY
        ====================================================== */
        secondary:
          [
            'bg-[#EBF2F2]',
            'text-[#1A2B48]',
            'border border-transparent',
            'shadow-sm',
            'hover:bg-[#DDEAEA]',
            'hover:shadow-sm',
          ].join(' '),

        /* =====================================================
           GHOST
        ====================================================== */
        ghost:
          [
            'bg-transparent',
            'text-[#688BB0]',
            'border border-transparent',
            'hover:bg-[#EBF2F2]',
            'hover:text-[#1A2B48]',
          ].join(' '),

        /* =====================================================
           LINK
        ====================================================== */
        link:
          [
            'bg-transparent',
            'text-[#3D6BB4]',
            'px-1',
            'underline-offset-4',
            'hover:text-[#1A2B48]',
            'hover:underline',
          ].join(' '),

        /* =====================================================
           ACCENT BLUE
        ====================================================== */
        accent:
          [
            'bg-[#3D6BB4]',
            'text-white',
            'border border-transparent',
            'shadow-sm',
            'hover:bg-[#345D9D]',
            'hover:shadow-md',
          ].join(' '),

        /* =====================================================
           LIGHT BLUE
        ====================================================== */
        light:
          [
            'bg-[#DDECF8]',
            'text-[#3D6BB4]',
            'border border-[#BBD5EA]',
            'shadow-sm',
            'hover:bg-[#D1E5F4]',
            'hover:border-[#A9CBE4]',
          ].join(' '),

        /* =====================================================
           SUCCESS
        ====================================================== */
        success:
          [
            'bg-[#2F765D]',
            'text-white',
            'border border-transparent',
            'shadow-sm',
            'hover:bg-[#27664F]',
            'hover:shadow-md',
            'focus-visible:ring-emerald-500/25',
          ].join(' '),

        /* =====================================================
           WARNING
        ====================================================== */
        warning:
          [
            'bg-[#B7791F]',
            'text-white',
            'border border-transparent',
            'shadow-sm',
            'hover:bg-[#9F671A]',
            'hover:shadow-md',
            'focus-visible:ring-amber-500/25',
          ].join(' '),

        /* =====================================================
           SOFT
        ====================================================== */
        soft:
          [
            'bg-[#F8FBFC]',
            'text-[#3D6BB4]',
            'border border-[#D8E4EC]',
            'shadow-none',
            'hover:bg-[#EBF2F2]',
            'hover:border-[#88B3D8]',
          ].join(' '),
      },

      size: {
        /* Default */
        default:
          [
            'h-10',
            'min-w-[40px]',
            'px-4',
            'py-2',
          ].join(' '),

        /* Small */
        sm:
          [
            'h-9',
            'min-w-[36px]',
            'rounded-xl',
            'px-3.5',
            'text-xs',
          ].join(' '),

        /* Large */
        lg:
          [
            'h-11',
            'min-w-[44px]',
            'rounded-xl',
            'px-6',
            'text-sm',
          ].join(' '),

        /* Extra large */
        xl:
          [
            'h-12',
            'min-w-[48px]',
            'rounded-xl',
            'px-7',
            'text-sm',
          ].join(' '),

        /* Icon */
        icon:
          [
            'h-10',
            'w-10',
            'p-0',
            'rounded-xl',
          ].join(' '),

        /* Small icon */
        'icon-sm':
          [
            'h-9',
            'w-9',
            'p-0',
            'rounded-xl',
          ].join(' '),

        /* Large icon */
        'icon-lg':
          [
            'h-11',
            'w-11',
            'p-0',
            'rounded-xl',
          ].join(' '),
      },

      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };