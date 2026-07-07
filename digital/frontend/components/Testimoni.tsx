"use client";

// Going pattern: alternating photo + large quote rows — the couple photos double
// as portfolio proof. ponytail: PLACEHOLDER quotes/photos — swap in real couples
// (with permission) before launch; structure stays as-is.

type Quote = {
  quote: string;
  detail: string;
  name: string;
  event: string;
  image: string;
};

const QUOTES: Quote[] = [
  {
    quote:
      "Our guests thought we hired an agency. It was just us, one evening, and Rimba.",
    detail:
      "We published the invitation the same night we picked the theme. Relatives RSVP'd on WhatsApp within minutes — my mother didn't have to explain anything to anyone.",
    name: "Dinda & Raka",
    event: "Jakarta · Kenangan collection",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "The check-in queue at our venue simply didn't exist.",
    detail:
      "Guests scanned their personal QR at the door and walked straight in. We watched the dashboard fill up from the family table — 340 guests, zero clipboards.",
    name: "Sari & Bimo",
    event: "Yogyakarta · Warisan collection",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Testimoni() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-16">
        <div className="space-y-4 max-w-2xl">
          <p className="text-sm font-medium uppercase text-[#93939f]">Testimoni</p>
          <h2 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            From couples who've already said yes
          </h2>
        </div>

        <div className="space-y-16 md:space-y-20">
          {QUOTES.map((q, i) => (
            <figure
              key={q.name}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[22px] aspect-[4/3] md:aspect-[4/5] max-w-md w-full mx-auto md:mx-0">
                <img
                  src={q.image}
                  alt={q.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              <div className="space-y-6 max-w-lg">
                <blockquote className="text-2xl md:text-3xl font-amoria font-normal tracking-tight leading-snug text-[#003c33]">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <p className="text-sm md:text-base leading-relaxed text-[#616161]">
                  {q.detail}
                </p>
                <figcaption className="space-y-0.5">
                  <p className="text-sm font-bold text-[#212121]">{q.name}</p>
                  <p className="text-xs text-[#93939f]">{q.event}</p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
