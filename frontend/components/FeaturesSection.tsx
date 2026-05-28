"use client";

import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";

// --- Internal Visual Components ---

const PaperStackVisual = () => {
  const papers = [
    { color: "#eeece7", rotate: "-rotate-3", label: "Soft Stone" },
    { color: "#edfce9", rotate: "rotate-1", label: "Pale Green" },
    { color: "#003c33", rotate: "-rotate-1", label: "Deep Green" },
    { color: "#ffffff", rotate: "rotate-2", label: "Cotton White" },
  ];
  return (
    <div className="relative w-full h-48 mt-8 flex items-center justify-center">
      {papers.map((p, i) => (
        <motion.div
          key={p.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`absolute w-32 h-44 rounded-[8px] border border-[#d9d9dd] shadow-sm ${p.rotate}`}
          style={{ backgroundColor: p.color, zIndex: i }}
        >
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[9px] font-medium text-[#212121]/40 uppercase">{p.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FinishingBar = () => {
  const finishes = [
    { label: "Foil Emas", pct: 82, color: "#e8b94a" },
    { label: "Emboss", pct: 67, color: "#346739" },
    { label: "Letterpress", pct: 54, color: "#003c33" },
    { label: "Spot UV", pct: 43, color: "#93939f" },
  ];
  return (
    <div className="mt-8 flex flex-col gap-4 w-full">
      {finishes.map((f, i) => (
        <div key={f.label} className="flex items-center gap-4">
          <span className="text-[10px] font-medium text-[#212121]/50 w-20 shrink-0">{f.label}</span>
          <div className="flex-1 h-1.5 bg-[#f2f2f2] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${f.pct}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ backgroundColor: f.color }}
            />
          </div>
          <span className="text-[10px] font-medium text-[#212121]/30 w-8 text-right">{f.pct}%</span>
        </div>
      ))}
    </div>
  );
};

// --- Main Section Component ---

export default function FeaturesSection() {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative w-full bg-[#ffffff] text-[#212121]">
      <section className="relative w-full flex flex-col items-center justify-start px-6 pt-32 pb-32 overflow-hidden">
        <div className="max-w-[1200px] w-full relative z-10">
          <header className="mb-20 md:mb-32 text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease }}
              className="font-poppins uppercase text-xs mb-6 block text-[#346739] font-bold"
            >
              Material & Craftsmanship
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease }}
              className="text-4xl md:text-6xl lg:text-7xl font-poppins font-normal tracking-[-0.035em] leading-[0.95] text-[#212121]"
            >
              Kertas, Tekstur, <br />
              dan Sentuhan Nyata
            </motion.h2>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

            {/* Card 1: Paper Selection (Large Vertical) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease }}
              className="md:row-span-2 p-10 bg-[#eeece7] rounded-[32px] border border-[#d9d9dd] flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-3xl font-poppins font-normal tracking-tight leading-[1.1] mb-6">
                  Pilihan <br />Kertas Premium
                </h3>
                <p className="text-[#212121]/50 text-sm leading-relaxed font-poppins">
                  Dari cotton 300gsm hingga kraft organik — setiap seri menggunakan bahan yang dipilih untuk ketahanan dan estetika.
                </p>
                <PaperStackVisual />
              </div>
              <div className="mt-12 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#346739]">Lihat Semua Material</span>
                <IconArrowRight className="w-5 h-5 text-[#212121]/20" />
              </div>
            </motion.div>

            {/* Card 2: Finishing Techniques (Wide Horizontal) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="md:col-span-2 p-10 bg-[#eeece7] rounded-[32px] border border-[#d9d9dd] flex flex-col"
            >
              <h3 className="text-3xl font-poppins font-normal tracking-tight mb-2">Teknik Finishing</h3>
              <p className="text-[#212121]/40 text-sm leading-relaxed max-w-md font-poppins">
                Foil, emboss, letterpress, dan spot UV — setiap sentuhan akhir menambah dimensi yang tidak bisa direplikasi secara digital.
              </p>
              <FinishingBar />
            </motion.div>

            {/* Card 3: Custom Size */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease }}
              className="p-8 bg-[#003c33] rounded-[32px] flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-white/10 rounded-[12px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase text-white/20">Ukuran</span>
              </div>
              <div>
                <h4 className="text-xl font-poppins font-normal mb-2 tracking-tight text-white">Ukuran Custom</h4>
                <p className="text-[10px] text-white/40 leading-relaxed font-poppins">
                  A5, A6, persegi, atau ukuran bespoke — kami cetak sesuai visi Anda.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Envelope & Packaging */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              className="p-8 bg-[#eeece7] rounded-[32px] border border-[#d9d9dd] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-[#346739]/10 rounded-[12px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#346739]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#212121]/20">Packaging</span>
              </div>
              <div>
                <h4 className="text-xl font-poppins font-normal mb-2 tracking-tight">Amplop & Kemasan</h4>
                <p className="text-[10px] text-[#212121]/40 leading-relaxed font-poppins">
                  Amplop linen, wax seal, dan kotak hadiah tersedia sebagai pelengkap setiap seri.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
