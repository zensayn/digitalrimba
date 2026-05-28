'use client';

import React from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import GlassSurface from '@/components/apple/GlassSurface';

export default function GalleryView() {
  const images = [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2938&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=2787&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2940&auto=format&fit=crop",
  ];

  return (
    <AppleTile theme="dark-2" className="py-0 px-0">
      <div className="w-full flex flex-col">
        {/* Teaser Video */}
        <div className="w-full h-[70vh] relative group cursor-pointer flex items-center justify-center bg-black">
          <Image 
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2938&auto=format&fit=crop" 
            alt="Teaser" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
          />
          <div className="relative z-10 flex flex-col items-center">
            <GlassSurface 
              width={80} 
              height={80} 
              borderRadius={40}
              className="mb-6 group-hover:scale-110 transition-transform duration-500"
            >
              <div className="w-full h-full flex items-center justify-center text-white">
                <IconPlayerPlayFilled size={32} />
              </div>
            </GlassSurface>
            <AppleTypography.DisplayMd className="text-white">
              Watch The Journey
            </AppleTypography.DisplayMd>
          </div>
        </div>

        {/* Curated Carousel */}
        <div className="w-full py-24 bg-[#252527] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-12">
            <AppleTypography.DisplayLg className="text-white">
              The Visual Story
            </AppleTypography.DisplayLg>
          </div>
          
          <div className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-12 snap-x hide-scrollbar">
            {images.map((src, idx) => (
              <div 
                key={idx} 
                className="relative min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] snap-center shrink-0 rounded-[18px] overflow-hidden shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0px]"
              >
                <Image 
                  src={src} 
                  alt={`Gallery ${idx}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppleTile>
  );
}
