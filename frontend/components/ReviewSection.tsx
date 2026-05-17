"use client";

import { motion } from "motion/react";
import { IconQuote } from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

const REVIEWS = [
  {
    id: 1,
    content: "Rimba Digital benar-benar mengubah cara kami mengelola hari besar. Sistem RSVP otomatisnya sangat membantu kami melacak tamu dengan akurasi 100%.",
    author: "Aditya Pratama",
    role: "Groom, Jakarta",
    color: "text-clay-lavender"
  },
  {
    id: 2,
    content: "Sebagai wedding planner, efisiensi adalah segalanya. Dashboard Budget & Planner dari Rimba memberikan transparansi yang luar biasa bagi klien kami.",
    author: "Santi Wijaya",
    role: "Wedding Planner",
    color: "text-clay-pink"
  },
  {
    id: 3,
    content: "Undangan webnya sangat estetik! Banyak tamu yang memuji musik dan galeri visualnya. Sangat intuitif dan elegan.",
    author: "Larasati Putri",
    role: "Bride, Bali",
    color: "text-clay-teal"
  },
  {
    id: 4,
    content: "Sistem QR Check-in di lokasi acara membuat alur masuk tamu menjadi sangat cepat dan profesional. Tidak ada lagi antrean panjang di meja penerima tamu.",
    author: "Budi Santoso",
    role: "Event Organizer",
    color: "text-clay-ochre"
  }
];

export default function ReviewSection() {
  const t = useTranslations('Navbar'); // Placeholder or add new category

  return (
    <section className="w-full bg-clay-canvas py-32 px-6 md:px-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-poppins font-normal tracking-[-0.035em] text-clay-ink leading-tight"
          >
            See What Our Clients <br />
            Have To Say!
          </motion.h2>
        </header>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="break-inside-avoid bg-white p-8 rounded-[24px] border border-clay-primary/5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-6"
            >
              <IconQuote className={`w-10 h-10 ${review.color} opacity-40`} />
              
              <p className="text-clay-ink/70 text-base leading-relaxed font-poppins">
                "{review.content}"
              </p>

              <div className="pt-6 border-t border-clay-primary/5">
                <h4 className="text-sm font-bold text-clay-ink font-poppins uppercase ">
                  {review.author}
                </h4>
                <p className="text-xs text-clay-ink/40 font-poppins">
                  {review.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
