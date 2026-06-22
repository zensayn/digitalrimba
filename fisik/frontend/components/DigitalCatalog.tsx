"use client";

import { motion } from "motion/react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";

const PRODUCTS = [
  {
    id: "p1",
    name: "Undangan Foil Emas",
    tag: "Heartwood",
    description: "Cetakan foil emas panas di atas kertas cotton 300gsm. Setiap huruf bersinar dengan kedalaman yang tidak bisa ditiru.",
    color: "#f2edc2",
    icon: (
      <svg className="w-6 h-6 text-[#212121]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    id: "p2",
    name: "Letterpress Klasik",
    tag: "Timber",
    description: "Teknik cetak timbul tradisional yang meninggalkan kesan mendalam pada kertas tebal bertekstur.",
    color: "#c8e6cd",
    icon: (
      <svg className="w-6 h-6 text-[#212121]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    id: "p3",
    name: "Emboss & Deboss",
    tag: "Heartwood",
    description: "Motif timbul atau tenggelam tanpa tinta — tekstur yang terasa di ujung jari sebelum dibaca.",
    color: "#efd4d4",
    icon: (
      <svg className="w-6 h-6 text-[#212121]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
  },
  {
    id: "p4",
    name: "Cetak Minimalis",
    tag: "Leaf",
    description: "Desain bersih dengan tipografi presisi di atas kertas linen putih. Elegan tanpa berlebihan.",
    color: "#dceeb1",
    icon: (
      <svg className="w-6 h-6 text-[#212121]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function DigitalCatalog() {
  const { setProduct } = useAppContext();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative w-full bg-[#ffffff] py-32 px-6 md:px-10 overflow-hidden border-t border-[#d9d9dd]">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <header className="mb-20 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="font-poppins font-bold uppercase text-xs mb-4 block text-[#346739]"
          >
            Katalog Produk
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-4xl md:text-6xl font-poppins font-normal tracking-[-0.035em] text-[#212121] leading-tight"
          >
            Teknik Cetak <br />Pilihan Kami
          </motion.h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              onClick={() => setProduct(product.name)}
              className="bg-white p-8 border border-[#e5e7eb] rounded-[32px] shadow-sm flex flex-col justify-between h-[400px] group cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <div
                    style={{ backgroundColor: product.color }}
                    className="w-12 h-12 flex items-center justify-center rounded-[12px] border border-[#d9d9dd]"
                  >
                    {product.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[#212121]/30">
                    {product.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-poppins font-normal tracking-tight text-[#212121] mb-4">
                  {product.name}
                </h3>
                <p className="text-[#212121]/50 text-sm leading-relaxed font-poppins">
                  {product.description}
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold uppercase text-[#346739] font-poppins">Lihat Detail</span>
                <IconArrowUpRight className="w-4 h-4 text-[#346739]" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center md:text-right">
          <button className="bg-[#346739] text-white px-10 py-5 text-xs font-bold rounded-full hover:opacity-90 transition-opacity uppercase font-poppins">
            Lihat Semua Teknik Cetak
          </button>
        </div>
      </div>

      {/* Decorative large text behind */}
      <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/4 opacity-[0.03] pointer-events-none select-none">
        <span className="text-[30vw] font-bold tracking-tighter leading-none whitespace-nowrap">CETAK</span>
      </div>
    </section>
  );
}
