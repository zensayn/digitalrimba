'use client';

import React from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import { IconQrcode } from '@tabler/icons-react';
import GlassSurface from '@/components/apple/GlassSurface';

export default function CheckInView() {
  return (
    <AppleTile theme="dark-3" className="py-[120px] min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Apple Wallet Style Pass */}
        <div className="w-full relative rounded-[18px] overflow-hidden mb-12 shadow-[rgba(0,0,0,0.5)_0px_20px_40px]">
          <div className="absolute inset-0 z-0">
            <GlassSurface 
              width="100%" 
              height="100%" 
              borderRadius={18}
              blur={20}
              opacity={0.8}
              brightness={90}
              backgroundOpacity={0.1}
              className="w-full h-full border border-white/20"
            />
          </div>
          
          <div className="relative z-10 w-full flex flex-col">
            <div className="bg-gradient-to-br from-[#2997ff] to-[#0066cc] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <AppleTypography.Caption className="text-white/90 uppercase  mb-1 font-semibold">
                Guest Pass
              </AppleTypography.Caption>
              <AppleTypography.DisplayMd className="text-white">
                John & Family
              </AppleTypography.DisplayMd>
            </div>
            
            <div className="p-8 flex flex-col items-center bg-white/10 backdrop-blur-md">
              <div className="p-4 bg-white rounded-[11px] mb-6 shadow-sm">
                <IconQrcode size={120} stroke={1.5} color="black" />
              </div>
              <AppleTypography.Caption className="text-white/60 mb-2 uppercase tracking-[1px]">
                Entry Code
              </AppleTypography.Caption>
              <AppleTypography.Tagline className="text-white">
                A-8472-B
              </AppleTypography.Tagline>
            </div>
          </div>
        </div>

        <AppleButton variant="store-hero" className="w-full max-w-[280px] justify-center mb-16">
          Add to Apple Wallet
        </AppleButton>

        <AppleTypography.DisplayLg className="text-white text-center">
          Thank you.
        </AppleTypography.DisplayLg>
      </div>
    </AppleTile>
  );
}
