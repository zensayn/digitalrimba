'use client';

import React, { useState } from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import GlassSurface from '@/components/apple/GlassSurface';

export default function GiftView() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AppleTile theme="light" className="py-[120px] relative">
      <div className="max-w-2xl text-center flex flex-col items-center">
        <AppleTypography.DisplayLg className="mb-4">
          The Tribute
        </AppleTypography.DisplayLg>
        <AppleTypography.LeadAiry className="mb-12">
          Your presence at our wedding is the greatest gift of all. However, should you wish to help us celebrate with a gift, a registry has been provided.
        </AppleTypography.LeadAiry>

        <AppleButton variant="store-hero" onClick={() => setShowModal(true)}>
          Send a Gift
        </AppleButton>
      </div>

      {/* Discreet Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-[18px]">
            <div className="absolute inset-0">
              <GlassSurface 
                width="100%" 
                height="100%" 
                borderRadius={18}
                blur={40}
                opacity={0.8}
                brightness={110}
                backgroundOpacity={0.6}
                className="w-full h-full shadow-[0_16px_56px_rgba(0,0,0,0.2)] border border-white/60"
              />
            </div>
            <div className="relative w-full h-full p-8 z-10">
              <AppleTypography.DisplayMd className="mb-6 block text-center">
              Gift Registry
            </AppleTypography.DisplayMd>
            
            <div className="flex flex-col gap-6">
              <div className="p-4 bg-[#f5f5f7] rounded-[11px] border border-[#e0e0e0]">
                <AppleTypography.BodyStrong className="block mb-1">Digital Transfer (BCA)</AppleTypography.BodyStrong>
                <AppleTypography.Body className="text-[#7a7a7a] mb-2">1234 5678 90 a/n John Doe</AppleTypography.Body>
                <AppleButton variant="secondary-pill" className="w-full text-[14px] py-1 h-[32px]">
                  Copy Account Number
                </AppleButton>
              </div>

              <div className="p-4 bg-[#f5f5f7] rounded-[11px] border border-[#e0e0e0] flex justify-between items-center">
                <div>
                  <AppleTypography.BodyStrong className="block mb-1">QRIS</AppleTypography.BodyStrong>
                  <AppleTypography.Body className="text-[#7a7a7a]">Scan via E-Wallet</AppleTypography.Body>
                </div>
                <AppleButton variant="dark-utility">
                  Show QR
                </AppleButton>
              </div>

              <div className="p-4 bg-[#f5f5f7] rounded-[11px] border border-[#e0e0e0]">
                <AppleTypography.BodyStrong className="block mb-1">Shipping Address</AppleTypography.BodyStrong>
                <AppleTypography.Body className="text-[#7a7a7a] text-[14px]">
                  123 Wedding Lane, Love City, 12345
                </AppleTypography.Body>
              </div>
            </div>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-[#0066cc] font-['SF_Pro_Text',system-ui,sans-serif] text-[17px] hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppleTile>
  );
}
