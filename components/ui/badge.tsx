import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const badge = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className, ...props }) => (
  <span className={clsx(badge({ variant }), className)} {...props}>
    {children}
  </span>
);

// import React from 'react'

// interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
//   children: React.ReactNode;
// }

// export function Badge({ children, className, ...props }: BadgeProps) {
//   return (
//     <div className={`px-2 py-1 rounded-md ${className}`} {...props}>
//       {children}
//     </div>
//   );
// }

