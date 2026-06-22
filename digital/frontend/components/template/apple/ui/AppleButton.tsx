'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { AppleTypography } from './AppleTypography';

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

interface AppleButtonProps extends Omit<MotionButtonProps, 'children'> {
  variant?: 'primary' | 'secondary-pill' | 'dark-utility' | 'store-hero' | 'icon-circular';
  children: React.ReactNode;
}

export const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(({
  variant = 'primary',
  children,
  className,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0071e3] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    'primary': "bg-[#0066cc] text-white rounded-full px-[22px] py-[11px]",
    'secondary-pill': "bg-transparent text-[#0066cc] border border-[#0066cc] rounded-full px-[22px] py-[11px]",
    'dark-utility': "bg-[#1d1d1f] text-white rounded-[8px] px-[15px] py-[8px]",
    'store-hero': "bg-[#0066cc] text-white rounded-full px-[28px] py-[14px]",
    'icon-circular': "bg-[rgba(210,210,215,0.64)] text-[#1d1d1f] rounded-full w-[44px] h-[44px] backdrop-blur-md"
  };

  const getTypography = () => {
    switch(variant) {
      case 'primary':
      case 'secondary-pill':
        return <AppleTypography.Body>{children}</AppleTypography.Body>;
      case 'store-hero':
        return <AppleTypography.ButtonLarge>{children}</AppleTypography.ButtonLarge>;
      case 'dark-utility':
        return <span className="font-normal text-[14px] leading-[1.29] tracking-[-0.224px] font-['SF_Pro_Text',system-ui,-apple-system,sans-serif]">{children}</span>;
      case 'icon-circular':
        return children; // Icons are passed directly
    }
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {getTypography()}
    </motion.button>
  );
});

AppleButton.displayName = 'AppleButton';
