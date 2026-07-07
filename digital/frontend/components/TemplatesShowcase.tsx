"use client";

import Link from "next/link";

// ponytail: Unsplash stand-ins like the rest of the landing page — swap for real theme screenshots when captured
type TemplateCard = {
  name: string;
  collection: string;
  caption: string;
  image: string;
};

const TEMPLATES: TemplateCard[] = [
  {
    name: "Warm Narrative",
    collection: "Kenangan",
    caption: "A warm, story-driven scroll with falling flowers and soft light.",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sacred Luxe",
    collection: "Kenangan",
    caption: "Deep tones and gilded detail for an intimate, ceremonial mood.",
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sinema Kisah",
    collection: "Kisah",
    caption: "Cinematic frames that let your story unfold scene by scene.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Warisan",
    collection: "Warisan",
    caption: "Heritage motifs and adat detail, set in an editorial layout.",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
  },
];

export default function TemplatesShowcase() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-sm font-medium uppercase text-[#93939f]">
            Invitation templates
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            Begin with a beautiful template
          </h2>
          <p className="text-lg leading-relaxed text-[#616161]">
            Every Rimba invitation starts from a hand-crafted theme. Pick one,
            add your story, and it becomes yours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="group cursor-pointer space-y-4">
              <div className="relative rounded-[22px] overflow-hidden aspect-[3/4] border border-[#f2f2f2]">
                <img
                  src={t.image}
                  alt={`${t.name} invitation template`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full border border-[#ffad9b] bg-white/90 text-xs font-medium text-[#ff7759]">
                  {t.collection}
                </span>
              </div>
              <div className="space-y-1 px-1">
                <h3 className="text-xl font-bold tracking-tight text-[#212121]">
                  {t.name}
                </h3>
                <p className="text-sm leading-relaxed text-[#616161]">
                  {t.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/dashboard/invitation"
            className="inline-block px-6 py-3 rounded-full bg-[#212121] text-white text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97] hover:bg-black"
          >
            Browse all templates
          </Link>
        </div>
      </div>
    </section>
  );
}
