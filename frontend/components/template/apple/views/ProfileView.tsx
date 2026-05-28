'use client';

import React from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import { IconBrandInstagram } from '@tabler/icons-react';

export default function ProfileView() {
  return (
    <AppleTile theme="light" className="px-0 py-0 overflow-visible">
      <div className="w-full flex flex-col md:flex-row min-h-screen">
        {/* Profile 1 */}
        <div className="flex-1 relative group h-[50vh] md:h-screen">
          <Image 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2787&auto=format&fit=crop" 
            alt="Groom" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
            <AppleTypography.DisplayLg className="text-white mb-2">
              Alex
            </AppleTypography.DisplayLg>
            <AppleTypography.Caption className="text-white/80 mb-6">
              Son of Mr. John Doe & Mrs. Jane Doe
            </AppleTypography.Caption>
            <AppleButton variant="icon-circular">
              <IconBrandInstagram size={20} />
            </AppleButton>
          </div>
        </div>
        
        {/* Profile 2 */}
        <div className="flex-1 relative group h-[50vh] md:h-screen">
          <Image 
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2874&auto=format&fit=crop" 
            alt="Bride" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
            <AppleTypography.DisplayLg className="text-white mb-2">
              Bella
            </AppleTypography.DisplayLg>
            <AppleTypography.Caption className="text-white/80 mb-6">
              Daughter of Mr. Richard Roe & Mrs. Mary Roe
            </AppleTypography.Caption>
            <AppleButton variant="icon-circular">
              <IconBrandInstagram size={20} />
            </AppleButton>
          </div>
        </div>
      </div>
    </AppleTile>
  );
}
