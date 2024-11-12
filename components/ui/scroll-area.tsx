import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

export const ScrollArea = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ScrollAreaPrimitive.Root className="w-full h-full overflow-hidden">
    <ScrollAreaPrimitive.Viewport className="w-full h-full">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="bg-gray-300 rounded-full"
    />
  </ScrollAreaPrimitive.Root>
);
// import React from 'react'

// interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
//   children: React.ReactNode;
// }

// export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
//   return (
//     <div className={`overflow-auto ${className}`} {...props}>
//       {children}
//     </div>
//   );
// }

