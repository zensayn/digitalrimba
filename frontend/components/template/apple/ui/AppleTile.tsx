import React from 'react';
import { cn } from '@/lib/utils';

interface AppleTileProps {
  children: React.ReactNode;
  theme?: 'light' | 'parchment' | 'dark' | 'dark-2' | 'dark-3';
  className?: string;
  id?: string;
}

export const AppleTile = ({
  children,
  theme = 'light',
  className,
  id
}: AppleTileProps) => {
  const themeStyles = {
    'light': "bg-[#ffffff] text-[#1d1d1f]",
    'parchment': "bg-[#f5f5f7] text-[#1d1d1f]",
    'dark': "bg-[#272729] text-[#ffffff]",
    'dark-2': "bg-[#2a2a2c] text-[#ffffff]",
    'dark-3': "bg-[#252527] text-[#ffffff]",
  };

  return (
    <section 
      id={id}
      className={cn(
        "relative w-full overflow-hidden flex flex-col items-center justify-center py-[80px] px-6 md:px-12",
        themeStyles[theme],
        className
      )}
    >
      <div className="max-w-[1440px] w-full mx-auto flex flex-col items-center">
        {children}
      </div>
    </section>
  );
};
