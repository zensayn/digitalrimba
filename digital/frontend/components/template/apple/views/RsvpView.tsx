'use client';

import React from 'react';
import { AppleTile } from '@/components/template/apple/ui/AppleTile';
import { AppleTypography } from '@/components/template/apple/ui/AppleTypography';
import { AppleButton } from '@/components/template/apple/ui/AppleButton';
import GlassSurface from '@/components/apple/GlassSurface';

export default function RsvpView() {
  return (
    <AppleTile theme="parchment" className="py-[120px]">
      <div className="max-w-xl w-full mx-auto">
        <AppleTypography.DisplayLg className="text-center mb-4">
          Will You Join Us?
        </AppleTypography.DisplayLg>
        <AppleTypography.Lead className="text-center text-[#7a7a7a] mb-12">
          Please confirm your attendance by October 1st.
        </AppleTypography.Lead>

        {/* Form Card */}
        <div className="relative w-full rounded-[18px] mb-16">
          <div className="absolute inset-0">
            <GlassSurface 
              width="100%" 
              height="100%" 
              borderRadius={18}
              blur={25}
              opacity={0.8}
              brightness={110}
              backgroundOpacity={0.4}
              className="w-full h-full shadow-[rgba(0,0,0,0.04)_0px_4px_24px] border border-white/50"
            />
          </div>
          <div className="relative z-10 p-8 md:p-12">
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold font-['SF_Pro_Text',system-ui,sans-serif] tracking-[-0.224px]">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-full px-[20px] py-[12px] text-[17px] font-['SF_Pro_Text',system-ui,sans-serif] outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold font-['SF_Pro_Text',system-ui,sans-serif] tracking-[-0.224px]">Number of Guests</label>
              <select className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-full px-[20px] py-[12px] text-[17px] font-['SF_Pro_Text',system-ui,sans-serif] outline-none transition-colors appearance-none">
                <option>1 (Just me)</option>
                <option>2</option>
                <option>Not attending</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold font-['SF_Pro_Text',system-ui,sans-serif] tracking-[-0.224px]">Dietary Restrictions</label>
              <input 
                type="text" 
                className="w-full bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-full px-[20px] py-[12px] text-[17px] font-['SF_Pro_Text',system-ui,sans-serif] outline-none transition-colors"
                placeholder="E.g., Vegetarian, Peanut Allergy"
              />
            </div>

            <AppleButton variant="primary" className="mt-4 w-full justify-center">
              Submit RSVP
            </AppleButton>
            </form>
          </div>
        </div>

        {/* Guestbook Feed */}
        <div>
          <AppleTypography.Tagline className="block mb-6 text-center">
            Prayers & Wishes
          </AppleTypography.Tagline>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="relative rounded-[18px]">
                <div className="absolute inset-0">
                  <GlassSurface 
                    width="100%" 
                    height="100%" 
                    borderRadius={18}
                    blur={20}
                    opacity={0.8}
                    brightness={110}
                    backgroundOpacity={0.3}
                    className="w-full h-full shadow-sm border border-white/50"
                  />
                </div>
                <div className="relative z-10 p-6">
                  <AppleTypography.BodyStrong className="block mb-1">
                    Jane Smith
                  </AppleTypography.BodyStrong>
                  <AppleTypography.Body className="text-[#333333]">
                    "Wishing you a lifetime of love and happiness. Can't wait to celebrate with you both!"
                  </AppleTypography.Body>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppleTile>
  );
}
