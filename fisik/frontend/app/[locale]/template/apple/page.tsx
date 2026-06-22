import React from 'react';
import HeroView from '@/components/template/apple/views/HeroView';
import PhilosophyView from '@/components/template/apple/views/PhilosophyView';
import ProfileView from '@/components/template/apple/views/ProfileView';
import LogisticsView from '@/components/template/apple/views/LogisticsView';
import GalleryView from '@/components/template/apple/views/GalleryView';
import RsvpView from '@/components/template/apple/views/RsvpView';
import GiftView from '@/components/template/apple/views/GiftView';
import CheckInView from '@/components/template/apple/views/CheckInView';

export default function AppleTemplatePage() {
  return (
    <div className="w-full">
      <HeroView />
      <PhilosophyView />
      <ProfileView />
      <LogisticsView />
      <GalleryView />
      <RsvpView />
      <GiftView />
      <CheckInView />
    </div>
  );
}
