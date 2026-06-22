import React from 'react';
import { cn } from '@/lib/utils'; // Assuming standard cn utility is present, or I will provide it if missing.

export const AppleTypography = {
  HeroDisplay: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h1 className={cn("font-semibold text-[56px] leading-[1.07] tracking-[-0.28px]", className)} style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}>
      {children}
    </h1>
  ),
  DisplayLg: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 className={cn("font-semibold text-[40px] leading-[1.10] tracking-normal", className)} style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}>
      {children}
    </h2>
  ),
  DisplayMd: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={cn("font-semibold text-[34px] leading-[1.47] tracking-[-0.374px]", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </h3>
  ),
  Lead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={cn("font-normal text-[28px] leading-[1.14] tracking-[0.196px]", className)} style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}>
      {children}
    </p>
  ),
  LeadAiry: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={cn("font-light text-[24px] leading-[1.5] tracking-normal", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </p>
  ),
  Tagline: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("font-semibold text-[21px] leading-[1.19] tracking-[0.231px]", className)} style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}>
      {children}
    </span>
  ),
  BodyStrong: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("font-semibold text-[17px] leading-[1.24] tracking-[-0.374px]", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </span>
  ),
  Body: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={cn("font-normal text-[17px] leading-[1.47] tracking-[-0.374px]", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </p>
  ),
  Caption: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("font-normal text-[14px] leading-[1.43] tracking-[-0.224px]", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </span>
  ),
  ButtonLarge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("font-light text-[18px] leading-none tracking-normal", className)} style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
      {children}
    </span>
  )
};
