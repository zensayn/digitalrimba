import React from 'react';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import { IconSearch, IconMenu2, IconLockSquareRounded } from '@tabler/icons-react';
import GlassSurface from '@/components/apple/GlassSurface';

export default function AppleTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white">
      {/* Sub Nav Frosted */}
      <div className="sticky top-0 z-40 w-full h-[52px] border-b border-[#e0e0e0]">
        <div className="absolute inset-0">
          <GlassSurface 
            width="100%" 
            height="100%" 
            borderRadius={0} 
            blur={30} 
            opacity={0.8}
            brightness={100}
            backgroundOpacity={0.5}
            className="w-full h-full"
          />
        </div>
        <div className="relative w-full h-full flex justify-center px-4">
          <div className="w-full max-w-[1000px] h-full flex items-center justify-between">
            <AppleTypography.Tagline>
              The Wedding
            </AppleTypography.Tagline>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <span className="text-[14px] leading-[1.29] tracking-[-0.224px] text-[#1d1d1f] hover:text-[#0066cc] cursor-pointer transition-colors">Overview</span>
                <span className="text-[14px] leading-[1.29] tracking-[-0.224px] text-[#1d1d1f] hover:text-[#0066cc] cursor-pointer transition-colors">Details</span>
                <span className="text-[14px] leading-[1.29] tracking-[-0.224px] text-[#1d1d1f] hover:text-[#0066cc] cursor-pointer transition-colors">Gallery</span>
              </div>
              <AppleButton variant="primary" className="py-1 px-3 text-[12px] h-auto">
                RSVP
              </AppleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full flex flex-col items-center">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-[#f5f5f7] text-[#7a7a7a] py-16 px-4 border-t border-[#e0e0e0] flex justify-center">
        <div className="w-full max-w-[1000px] flex flex-col gap-4">
          <div className="text-[12px] leading-[1.3] tracking-[-0.08px]">
            * Dietary restrictions must be submitted 2 weeks prior.
          </div>
          <div className="w-full h-[1px] bg-[#e0e0e0] my-2" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-[12px] leading-[1.0] tracking-[-0.12px]">
            <p>Copyright © 2026. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="hover:text-[#333333] cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-[#333333] cursor-pointer transition-colors">Terms of Use</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
