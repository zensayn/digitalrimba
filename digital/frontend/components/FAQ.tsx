"use client";

// Cohere's own FAQ pattern: pinned heading left, hairline accordion rows right,
// open row marked by a coral top rule. Native <details> — no JS state.

import { WHATSAPP_URL } from "@/lib/contact";

const FAQS = [
  {
    q: "Berapa lama prosesnya?",
    a: "Sekitar 15 menit dari memilih tema sampai undangan tayang. Tidak ada antrean desain — semuanya langsung dari dashboard Anda.",
  },
  {
    q: "Bisa revisi data setelah tayang?",
    a: "Bisa, kapan saja dan tanpa batas. Ubah nama, jadwal, atau lokasi — perubahan langsung live di link yang sama, tanpa perlu kirim ulang ke tamu.",
  },
  {
    q: "Apakah ada iklan di undangan saya?",
    a: "Tidak pernah. Halaman undangan hanya berisi nama dan cerita Anda — tanpa banner, tanpa watermark, tanpa promosi vendor.",
  },
  {
    q: "Bagaimana tamu melakukan RSVP?",
    a: "Setiap tamu menerima link personal dengan namanya. Mereka cukup membuka link dan mengonfirmasi kehadiran — balasan masuk otomatis ke dashboard Anda lewat WhatsApp.",
  },
  {
    q: "Berapa lama undangan saya aktif?",
    a: "Tergantung paket: Kenangan 6 bulan, Kisah 12 bulan, dan Warisan selamanya. Anda bisa upgrade kapan saja tanpa kehilangan data.",
  },
  {
    q: "Apakah data tamu saya aman?",
    a: "Data tamu dan RSVP bersifat privat, hanya untuk Anda, dan bisa diekspor kapan saja. Kami tidak menjual atau membagikan data Anda.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-24 items-start">
        <div className="space-y-4 lg:sticky lg:top-32">
          <p className="text-sm font-medium uppercase text-[#93939f]">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="text-base leading-relaxed text-[#616161] max-w-sm">
            Masih ragu? Tanyakan langsung —{" "}
            <a
              href={WHATSAPP_URL}
              className="font-medium text-[#212121] underline underline-offset-4 decoration-[#212121]/25 hover:decoration-[#ff7759] hover:text-[#ff7759] transition-colors duration-200"
            >
              kami balas lewat WhatsApp
            </a>
            .
          </p>
        </div>

        <div>
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group border-t border-[#d9d9dd] open:border-t-2 open:border-[#ff7759] last:border-b last:border-b-[#d9d9dd] transition-colors duration-200"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-base md:text-lg font-medium tracking-tight text-[#212121]">
                  {f.q}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[#93939f] transition-transform duration-200 ease-out group-open:rotate-180"
                >
                  ↓
                </span>
              </summary>
              <p className="pb-6 pr-10 text-sm md:text-base leading-relaxed text-[#616161] max-w-xl">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
