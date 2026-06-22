'use client';

import React from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import { motion } from 'motion/react';
import GlassSurface from '@/components/apple/GlassSurface';

export default function HeroView() {
  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col justify-end pb-[80px]">
      {/* Background Video Loop */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-70"
          src="https://cdn.pixabay.com/video/2021/08/04/83861-584737837_large.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative max-w-2xl w-full p-12 rounded-[24px] overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <GlassSurface 
              width="100%" 
              height="100%" 
              borderRadius={24}
              blur={30}
              opacity={0.8}
              brightness={110}
              backgroundOpacity={0.2}
              className="w-full h-full border border-white/20"
            />
          </div>
          <div className="relative z-10">
            <AppleTypography.Caption className="text-white/90 uppercase tracking-[2px] mb-4 font-semibold">
              Welcome, John & Family
            </AppleTypography.Caption>
            <AppleTypography.HeroDisplay className="text-white mb-6">
              A & B
            </AppleTypography.HeroDisplay>
            <AppleTypography.LeadAiry className="text-white/90 mb-8 max-w-md mx-auto">
              We invite you to celebrate our beginning.
            </AppleTypography.LeadAiry>
            
            <div className="flex justify-center">
              <AppleButton variant="store-hero">
                Enter Experience
              </AppleButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
