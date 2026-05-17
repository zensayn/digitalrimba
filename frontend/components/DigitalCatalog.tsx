"use client";

import { motion } from "motion/react";
import { IconAddressBook, IconQrcode, IconCalendarStats, IconMailOpened, IconArrowUpRight } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";

const PRODUCTS = [
  {
    id: "p1",
    name: "Premium Web Invitations",
    tag: "Aesthetic",
    description: "Undangan web interaktif dengan personalisasi nama tamu, musik, dan galeri visual yang mulus.",
    icon: IconMailOpened,
    color: "#f2edc2" // clay-peach-soft
  },
  {
    id: "p2",
    name: "Smart RSVP System",
    tag: "Efficiency",
    description: "Manajemen konfirmasi kehadiran secara real-time yang terintegrasi dengan API WhatsApp.",
    icon: IconAddressBook,
    color: "#c8e6cd" // clay-teal-soft
  },
  {
    id: "p3",
    name: "Digital Guestbook",
    tag: "QR Check-in",
    description: "Validasi tamu di lokasi acara menggunakan QR Code untuk kemudahan alur masuk dan pendataan.",
    icon: IconQrcode,
    color: "#efd4d4" // clay-pink-soft
  },
  {
    id: "p4",
    name: "Budget & Planner",
    tag: "Management",
    description: "Alat berbasis dashboard bagi pengantin untuk mengelola pengeluaran dan checklist vendor.",
    icon: IconCalendarStats,
    color: "#dceeb1" // clay-teal-soft
  }
];

export default function DigitalCatalog() {
  const { setProduct } = useAppContext();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative w-full bg-clay-canvas py-32 px-6 md:px-10 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-20 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="font-poppins font-semibold uppercase tracking-[0.15em] text-xs mb-4 block text-clay-teal"
          >
            Digital Catalog
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-4xl md:text-6xl font-amoria font-normal tracking-[-0.035em] text-clay-ink leading-tight"
          >
            SaaS <br />Feature Suite
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
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              onClick={() => setProduct(product.name)}
              className="bg-white p-8 border border-clay-primary/5 rounded-[24px] shadow-sm flex flex-col justify-between h-[400px] group cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                   <div 
                     style={{ backgroundColor: product.color }}
                     className="w-12 h-12 flex items-center justify-center rounded-[12px] border border-clay-primary/5"
                   >
                     <product.icon className="w-6 h-6 text-clay-ink/60" />
                   </div>
                   <span className="text-[10px] font-bold uppercase  text-clay-ink/30">
                     {product.tag}
                   </span>
                </div>
                <h3 className="text-2xl font-amoria font-normal tracking-tight text-clay-ink mb-4">
                  {product.name}
                </h3>
                <p className="text-clay-ink/50 text-sm leading-relaxed font-poppins">
                  {product.description}
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-clay-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold uppercase  text-clay-teal font-poppins">Configure</span>
                <IconArrowUpRight className="w-4 h-4 text-clay-teal" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center md:text-right">
          <button className="bg-clay-primary text-white px-10 py-5 text-lg font-semibold rounded-[12px] hover:opacity-90 transition-opacity uppercase  text-xs font-poppins">
            Access Pricing Engine
          </button>
        </div>
      </div>

      {/* Decorative large text behind */}
      <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/4 opacity-[0.03] pointer-events-none select-none">
        <span className="text-[30vw] font-bold tracking-tighter leading-none whitespace-nowrap">CATALOG</span>
      </div>
    </section>
  );
}
