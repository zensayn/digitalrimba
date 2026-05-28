'use client';

import React, { useState } from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import GlassSurface from '@/components/apple/GlassSurface';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';

export default function PhilosophyView() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AppleTile theme="dark" className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center relative flex flex-col items-center">
        <AppleTypography.LeadAiry className="text-white text-center leading-[1.6]">
          "Love is not about looking at each other, but looking in the same direction."
          <br /><br />
          We built our foundation on this simple truth.
        </AppleTypography.LeadAiry>
        
        {/* Floating GlassSurface button for background music */}
        <div className="mt-16">
          <GlassSurface 
            width={64} 
            height={64} 
            borderRadius={32}
            brightness={80}
            opacity={0.1}
            blur={20}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full h-full flex items-center justify-center text-white"
            >
              {isPlaying ? <IconPlayerPauseFilled size={24} /> : <IconPlayerPlayFilled size={24} />}
            </button>
          </GlassSurface>
        </div>
        <AppleTypography.Caption className="text-[#7a7a7a] mt-4">
          {isPlaying ? 'Playing Soundtrack' : 'Play Soundtrack'}
        </AppleTypography.Caption>
      </div>
    </AppleTile>
  );
}
