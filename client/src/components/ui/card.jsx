import * as React from 'react';
import { cn } from '@/lib/utils';

/* =========================================================
   CARD
========================================================= */

const Card = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          'w-full',
          'rounded-[24px]',
          'border border-white/70',
          'bg-white',
          'text-[#1A2B48]',
          'shadow-sm',
          'transition-all duration-300',
          'overflow-hidden',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

/* =========================================================
   CARD HEADER
========================================================= */

const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          'flex flex-col',
          'space-y-1.5',
          'p-5 sm:p-6 md:p-7',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

/* =========================================================
   CARD TITLE
========================================================= */

const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        [
          'text-xl sm:text-2xl',
          'font-semibold',
          'leading-tight',
          'tracking-tight',
          'text-[#1A2B48]',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

/* =========================================================
   CARD DESCRIPTION
========================================================= */

const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        [
          'text-sm',
          'leading-6',
          'text-[#688BB0]',
          'max-w-2xl',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

/* =========================================================
   CARD CONTENT
========================================================= */

const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          'w-full',
          'p-5',
          'pt-0',
          'sm:p-6',
          'sm:pt-0',
          'md:p-7',
          'md:pt-0',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

/* =========================================================
   CARD FOOTER
========================================================= */

const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          'flex',
          'flex-col',
          'items-stretch',
          'gap-3',
          'p-5',
          'pt-0',
          'sm:flex-row',
          'sm:items-center',
          'sm:p-6',
          'sm:pt-0',
          'md:p-7',
          'md:pt-0',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

/* =========================================================
   EXPORTS
========================================================= */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};