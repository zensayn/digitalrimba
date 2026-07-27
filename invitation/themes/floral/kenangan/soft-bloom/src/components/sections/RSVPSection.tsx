"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import FloralTitle from "@/components/shared/FloralTitle";
import SideVines from "@/components/shared/SideVines";
import { rhythmVars } from "@/lib/rhythm";

export default function RSVPSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | null>(null);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  // Reveal saat scroll dinonaktifkan — konten tampil langsung.
  const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="rsvp" className="snap-section flow-section mood-mist reveal-scope" style={rhythmVars("rsvp")}>
      <div className="soft-wash" />
      {/* RantingSamping beraspek 3:1 — pada 72vh lebarnya ±190px per sisi dan
          menutupi hampir seluruh layar HP. Dipendekkan + form diberi panel
          kertas (.panel) supaya teks tak pernah duduk di atas flora. */}
      <SideVines sides={["left", "right"]} height="min(50vh, 400px)" opacity={0.55} zIndex={1} />

      {/* Tanpa scroller dalam (overflow-y-auto + maxHeight): dulu ia "menelan"
          gulir halaman sampai mentok → terasa nyangkut seperti magnet di section
          ini. Kini section memanjang alami dan halaman yang menggulir. */}
      <div ref={ref} className="section-shell">
        <div
          className="panel flex w-full flex-col items-center text-center"
          style={{ padding: "clamp(30px, 8vw, 40px)", gap: "var(--space-block)" }}
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="type-eyebrow"
          >
            Konfirmasi Kehadiran
          </motion.p>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <FloralTitle serif>RSVP</FloralTitle>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center" style={{ gap: "var(--space-md)" }}>
              <div className="icon-badge icon-badge-accent" style={{ width: 62, height: 62 }}>
                <Check size={24} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <p className="type-heading">Terima Kasih</p>
              <p className="type-body">
                Konfirmasi Anda telah kami terima.<br />
                Kami menantikan kehadiran Anda.
              </p>
            </motion.div>
          ) : (
            <motion.form
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              onSubmit={handleSubmit}
              className="flex w-full flex-col text-left"
              // 20px antar-field — angka form warm-narrative yang juga dipakai
              // prada-melati (spec spacing §2.4), di sini lewat --space-lg.
              style={{ gap: "var(--space-lg)" }}
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="type-label">Nama Tamu</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" className="input-field" required />
              </div>

              {/* Attendance */}
              <div className="flex flex-col gap-2">
                <label className="type-label">Konfirmasi</label>
                <div className="flex gap-2">
                  {/* Rupa keadaan terpilih ditentukan CSS lewat [aria-pressed],
                      jadi atribut aksesibilitas dan tampilan tak bisa berbeda.
                      Tinggi kotak (padding 11px di .btn-choice) disamakan dengan
                      prada-melati — jangan diganti utilitas py-* Tailwind:
                      preflight menyetel padding:0 pada <button> dan utilitasnya
                      tak ikut ter-generate, dulu tombolnya jadi cuma ~21px. */}
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAttendance(opt)}
                      aria-pressed={attendance === opt}
                      className="btn-choice"
                    >
                      {opt === "hadir" ? "Hadir" : "Tidak Hadir"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pax */}
              {attendance === "hadir" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-2">
                  <label className="type-label">Jumlah Tamu</label>
                  <div className="flex items-center" style={{ gap: "var(--space-md)" }}>
                    <button type="button" aria-label="Kurangi jumlah tamu" onClick={() => setPax(Math.max(1, pax - 1))} className="btn-round">−</button>
                    <span className="type-figure" style={{ minWidth: "1.5ch", textAlign: "center" }}>{pax}</span>
                    <button type="button" aria-label="Tambah jumlah tamu" onClick={() => setPax(Math.min(5, pax + 1))} className="btn-round">+</button>
                  </div>
                </motion.div>
              )}

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="type-label">Ucapan (opsional)</label>
                <textarea
                  ref={messageRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (messageRef.current) {
                      messageRef.current.style.height = "auto";
                      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
                    }
                  }}
                  placeholder="Tuliskan ucapan & doa..."
                  className="input-field overflow-hidden resize-none"
                  rows={1}
                  style={{ minHeight: "40px" }}
                />
              </div>

              <div className="flex justify-center">
                <button type="submit" disabled={loading || !name || !attendance} className="btn-primary">
                  {loading ? "Mengirim..." : "Kirim Konfirmasi"}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
