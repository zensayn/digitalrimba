import Image from "next/image";
import Link from "next/link";

// ponytail: static content, no CMS — wire to real product pages when they exist
const UPCOMING = [
  {
    name: "Digital RSVP Coordinator",
    description:
      "One command center for every guest reply — reminders, headcounts, and seating, handled for you.",
  },
  {
    name: "Event Landing Pages",
    description:
      "A beautiful page for any celebration — birthdays, corporate galas, community gatherings.",
  },
];

export default function ProductSuite() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-6">
        <div className="max-w-3xl space-y-4 pb-6">
          <p className="text-sm font-medium uppercase text-[#93939f]">
            Layanan Kami
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            Today, invitations. Tomorrow, your whole event.
          </h2>
          <p className="text-lg leading-relaxed text-[#616161]">
            Rimba starts with the invitation — and grows with everything that
            follows it.
          </p>
        </div>

        {/* Flagship — full-bleed photo card with floating RSVP UI (WhatsApp "Message privately" pattern) */}
        <div className="relative rounded-[28px] overflow-hidden min-h-[520px] md:min-h-[560px] flex items-center">
          <Image
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80"
            alt="Wedding celebration"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim for copy legibility, deep-green tinted */}
          <div className="absolute inset-0 bg-linear-to-r from-[#00201b]/90 via-[#00201b]/55 to-[#00201b]/10" />

          {/* Copy — left */}
          <div className="relative z-10 p-8 md:p-14 lg:p-16 max-w-lg space-y-6 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-[#edfce9] text-[#003c33] text-xs font-medium">
              Available now
            </span>
            <h3 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-[1.05]">
              Wedding Invitations
            </h3>
            <p className="text-base leading-relaxed text-white/80">
              Hand-crafted digital invitations with smart RSVP over WhatsApp,
              guest tracking, and secure check-in at the door — the full
              journey from &ldquo;save the date&rdquo; to the last dance.
            </p>
            <Link
              href="/dashboard/invitation"
              className="inline-block px-6 py-3 rounded-full bg-white text-[#003c33] text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Explore invitations
            </Link>
          </div>

          {/* Floating product UI — the features, shown instead of listed */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 pointer-events-none hidden sm:block"
          >
            {/* Incoming RSVP bubble */}
            <div className="absolute top-[14%] right-[8%] rounded-2xl rounded-tr-sm bg-white px-4 py-3 shadow-lg max-w-[240px]">
              <p className="text-sm text-[#212121]">
                Kami hadir berdua! 🤍
              </p>
              <p className="mt-1 text-right text-[10px] text-[#93939f]">
                19:02 ✓✓
              </p>
            </div>
            {/* Guest-count console chip */}
            <div className="absolute top-[42%] right-[22%] rounded-2xl bg-[#0a0a0a]/85 backdrop-blur px-4 py-3 text-white shadow-lg">
              <p className="text-[10px] uppercase text-white/50">
                Guest tracking
              </p>
              <p className="text-lg font-medium leading-tight">
                128 <span className="text-sm font-normal text-white/70">confirmed</span>
              </p>
            </div>
            {/* Check-in confirmation bubble */}
            <div className="absolute bottom-[12%] right-[10%] flex items-center gap-3 rounded-2xl rounded-bl-sm bg-[#edfce9] px-4 py-3 shadow-lg">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#346739] text-xs text-white">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-[#003c33]">
                  Dinda &amp; Raka checked in
                </p>
                <p className="text-[10px] text-[#346739]/70">at the venue · just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Future slots — quiet stone cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPCOMING.map((p) => (
            <div
              key={p.name}
              className="rounded-[28px] bg-[#eeece7] p-8 md:p-10 space-y-4"
            >
              <span className="inline-block px-3 py-1 rounded-full border border-[#d9d9dd] text-xs font-medium text-[#75758a]">
                Segera
              </span>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#212121]">
                {p.name}
              </h3>
              <p className="text-sm leading-relaxed text-[#616161] max-w-sm">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
