"use client";

import Image from "next/image";
import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/contact";

// Lightship pattern: one photo, one headline, one action pair.

export default function FinalCTA() {
  return (
    <section className="bg-white py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="relative max-w-[1300px] mx-auto rounded-[28px] overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center justify-center text-center">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
          alt="A couple on their wedding day"
          fill
          sizes="(min-width: 1300px) 1300px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#00201b]/55" />

        <div className="relative z-10 max-w-2xl px-6 space-y-8">
          <h2 className="text-4xl md:text-6xl font-amoria font-normal tracking-tight leading-[1.08] text-white">
            Hari bahagiamu dimulai dari sini
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-white/75">
            Pilih tema hari ini — undanganmu tayang 15 menit kemudian.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/invitations/new">
              <TextureButton variant="secondary" size="lg" className="rounded-full">
                Buat undanganmu sekarang
              </TextureButton>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <TextureButton variant="primary" size="lg" className="rounded-full">
                <WhatsAppIcon className="size-4" />
                Tanya via WhatsApp
              </TextureButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
