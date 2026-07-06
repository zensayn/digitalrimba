"use client";

// Mews "constitution" pattern: unframed, rule-separated numbered rows — no cards
const PROMISES = [
  {
    title: "Live in minutes, not days",
    detail:
      "Pick a theme, add your story, publish. Every revision is instant — no email back-and-forth with a designer.",
  },
  {
    title: "Typography set like print",
    detail:
      "Type is hand-set with the care of a printed invitation, tuned for every screen your guests hold.",
  },
  {
    title: "No ads on your invitation. Ever.",
    detail:
      "The page your guests screenshot carries your names only — no vendor banners, no watermarks, no upsells.",
  },
  {
    title: "Your guest list stays yours",
    detail:
      "RSVPs and guest data are private to you and exportable anytime. We are not in the data business.",
  },
  {
    title: "One platform, end to end",
    detail:
      "Invitation, RSVP, and check-in at the door are built by one team — not a patchwork of plugins.",
  },
];

export default function WhyRimba() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-24">
        {/* Left — anchored header */}
        <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <p className="text-sm font-medium uppercase text-[#93939f]">
            Kenapa Pilih Rimba Digital
          </p>
          <h2 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            Five promises, in writing
          </h2>
          <p className="text-base leading-relaxed text-[#616161] max-w-sm">
            Everything a digital invitation usually gets wrong, and what we do
            instead.
          </p>
        </div>

        {/* Right — rule-separated promise rows */}
        <div>
          {PROMISES.map((p, i) => (
            <div
              key={p.title}
              className="group flex items-baseline justify-between gap-8 border-t border-[#d9d9dd] py-8 last:border-b"
            >
              <div className="space-y-2 max-w-xl">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#212121]">
                  {p.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-[#616161]">
                  {p.detail}
                </p>
              </div>
              <span className="shrink-0 text-sm text-[#93939f] transition-colors duration-200 group-hover:text-[#ff7759]">
                /0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
