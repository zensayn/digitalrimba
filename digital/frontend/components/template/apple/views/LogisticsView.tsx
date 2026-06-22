'use client';

import React, { useState, useEffect } from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import GlassSurface from '@/components/apple/GlassSurface';

export default function LogisticsView() {
  const [activeEvent, setActiveEvent] = useState<'akad' | 'reception'>('akad');
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Dummy countdown logic
    const interval = setInterval(() => {
      setTimeLeft({ d: 42, h: 14, m: 30, s: new Date().getSeconds() });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppleTile theme="parchment" className="min-h-screen pt-[120px]">
      <AppleTypography.DisplayLg className="mb-4 text-center">
        The Compass
      </AppleTypography.DisplayLg>
      <AppleTypography.Lead className="text-[#7a7a7a] mb-12 text-center max-w-2xl mx-auto">
        Join us in celebrating our special day.
      </AppleTypography.Lead>

      {/* Dual-Event Toggle */}
      <div className="flex bg-[#e0e0e0] p-1 rounded-full mb-12 w-full max-w-sm mx-auto relative">
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out ${activeEvent === 'reception' ? 'translate-x-full' : 'translate-x-0'}`} 
        />
        <button 
          onClick={() => setActiveEvent('akad')}
          className={`flex-1 relative z-10 py-2 text-center text-[14px] font-semibold transition-colors ${activeEvent === 'akad' ? 'text-[#1d1d1f]' : 'text-[#7a7a7a]'}`}
          style={{ fontFamily: 'SF Pro Text, system-ui, sans-serif' }}
        >
          Matrimony
        </button>
        <button 
          onClick={() => setActiveEvent('reception')}
          className={`flex-1 relative z-10 py-2 text-center text-[14px] font-semibold transition-colors ${activeEvent === 'reception' ? 'text-[#1d1d1f]' : 'text-[#7a7a7a]'}`}
          style={{ fontFamily: 'SF Pro Text, system-ui, sans-serif' }}
        >
          Reception
        </button>
      </div>

      {/* Details Card */}
      <div className="w-full max-w-4xl relative rounded-[18px]">
        <div className="absolute inset-0">
          <GlassSurface 
            width="100%" 
            height="100%" 
            borderRadius={18}
            blur={25}
            opacity={0.8}
            brightness={110}
            backgroundOpacity={0.4}
            className="w-full h-full shadow-[rgba(0,0,0,0.04)_0px_4px_24px] border border-white/40"
          />
        </div>
        
        <div className="relative w-full h-full p-8 md:p-12 flex flex-col md:flex-row gap-12 z-10">
          {/* Info Side */}
          <div className="flex-1 flex flex-col justify-center">
            <AppleTypography.DisplayMd className="mb-2">
              {activeEvent === 'akad' ? 'Holy Matrimony' : 'Grand Reception'}
            </AppleTypography.DisplayMd>
            <AppleTypography.BodyStrong className="mb-6 block text-[#7a7a7a]">
              Saturday, October 24th, 2026
            </AppleTypography.BodyStrong>
            
            <div className="mb-8">
              <AppleTypography.Body className="mb-1">
                {activeEvent === 'akad' ? '08:00 AM - 10:00 AM' : '07:00 PM - 10:00 PM'}
              </AppleTypography.Body>
              <AppleTypography.Body className="text-[#7a7a7a]">
                The Ritz-Carlton Jakarta, Pacific Place<br />
                Grand Ballroom
              </AppleTypography.Body>
            </div>

            <div className="flex gap-4">
              <AppleButton variant="dark-utility">
                Save to Calendar
              </AppleButton>
              <AppleButton variant="secondary-pill">
                Open in Maps
              </AppleButton>
            </div>
          </div>

          {/* Map Side */}
          <div className="flex-1 aspect-square md:aspect-auto rounded-[8px] overflow-hidden bg-[#f5f5f7] relative">
            {/* Placeholder Map Image that looks desaturated */}
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2948&auto=format&fit=crop&sat=-100&bri=20" 
              alt="Map" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[8px]" />
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="mt-24 flex justify-center gap-8 text-center">
        {[
          { label: 'Days', value: timeLeft.d },
          { label: 'Hours', value: timeLeft.h },
          { label: 'Mins', value: timeLeft.m },
          { label: 'Secs', value: timeLeft.s },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <AppleTypography.DisplayLg className="w-[80px]">
              {String(item.value).padStart(2, '0')}
            </AppleTypography.DisplayLg>
            <AppleTypography.Caption className="text-[#7a7a7a] mt-2">
              {item.label}
            </AppleTypography.Caption>
          </div>
        ))}
      </div>
    </AppleTile>
  );
}
