"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import FloralTitle from "@/components/shared/FloralTitle";
import SideVines from "@/components/shared/SideVines";
import CardVines from "@/components/shared/CardVines";
import TallBlooms from "@/components/shared/TallBlooms";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !attendance) return;

    setLoading(true);
    // Tanpa backend/D1: RSVP kosmetik — jeda singkat lalu tampilkan layar
    // terima kasih. Data konfirmasi tidak disimpan (selaras dengan soft-bloom
    // setier). Tim memutuskan tidak jadi memakai Cloudflare D1.
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
    <section id="rsvp" className="snap-section flow-section mood-mist reveal-scope">
      <div className="soft-wash" />
      {/* Juntaian tepi dipendekkan + form diberi panel kertas (bloom-panel)
          supaya teks tak pernah duduk di atas flora. */}
      <SideVines sides={["left", "right"]} height="min(50vh, 400px)" opacity={0.55} zIndex={1} />
      {/* Section ini sempat paling sepi flora (hanya sulur panel). Kaki section
          diberi hamparan meadow + bunga tangkai tinggi bergoyang di kedua tepi —
          semua z1, tetap di belakang panel form (z10) jadi teks aman. */}
      <img
        src={asset("MeadowBloomBand.webp")}
        alt=""
        aria-hidden="true"
        onError={hideBrokenImage}
        loading="lazy"
        decoding="async"
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "auto", zIndex: 1, pointerEvents: "none", opacity: 0.9 }}
      />
      <TallBlooms sides={["left", "right"]} width="clamp(96px, 27vw, 140px)" opacity={0.9} zIndex={1} />

      {/* Tanpa scroller dalam (overflow-y-auto + maxHeight): dulu ia "menelan"
          gulir halaman sampai mentok → terasa nyangkut seperti magnet di section
          ini. Kini section memanjang alami dan halaman yang menggulir. */}
      <div
        ref={ref}
        className="relative z-10 w-full mx-auto px-6"
        style={{
          maxWidth: "356px",
          paddingTop: "clamp(40px, 8vh, 80px)",
          paddingBottom: "clamp(40px, 8vh, 80px)",
        }}
      >
        {/* Tinggi form dinamis (field pax muncul/hilang, textarea melar), jadi
            dekorasinya harus berukuran TETAP: juntaian sudut atas + kluster
            mawar sudut bawah, bukan bingkai gambar objectFit fill yang ikut
            melar dan buketnya menutup judul/tombol (temuan QA Jul 2026). */}
        <div style={{ position: "relative" }}>
          <CardVines width="clamp(60px, 17vw, 88px)" top={-26} inset={-18} zIndex={4} dropShadow="drop-shadow(0 8px 15px rgba(58,58,54,0.16))" />
          <img
            src={asset("SwayRoseCluster.webp")}
            alt=""
            aria-hidden="true"
            onError={hideBrokenImage}
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", right: -20, bottom: -22, width: "clamp(76px, 22vw, 104px)", zIndex: 4, pointerEvents: "none", filter: "drop-shadow(0 8px 15px rgba(58,58,54,0.14))" }}
          />
          <div className="bloom-panel flex flex-col items-center text-center" style={{ position: "relative", padding: "clamp(24px, 7vw, 32px)" }}>
            {/* Garis emas dalam pengganti bingkai — border CSS tak ikut melar */}
            <div aria-hidden="true" style={{ position: "absolute", inset: 8, border: "1px solid rgba(184, 149, 94, 0.45)", borderRadius: 5, pointerEvents: "none" }} />
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="type-eyebrow"
              style={{ marginBottom: 4 }}
            >
              Konfirmasi Kehadiran
            </motion.p>

            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{ marginBottom: "clamp(20px, 5vh, 36px)" }}
            >
              <FloralTitle serif>RSVP</FloralTitle>
            </motion.div>

            {submitted ? (
              <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-8" role="status" aria-live="polite">
                <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent)" }}>
                  <Check size={20} color="var(--accent)" strokeWidth={1.5} />
                </div>
                <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 500, fontStyle: "italic" }}>Terima Kasih</p>
                <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.8, fontWeight: 300 }}>
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
                className="w-full flex flex-col gap-5 text-left"
              >
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="rsvp-name" className="type-label">Nama Tamu</label>
                  <input
                    id="rsvp-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="input-bloom"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Attendance */}
                <fieldset className="rsvp-attendance-fieldset flex flex-col gap-2">
                  <legend className="type-label">Konfirmasi</legend>
                  <div className="rsvp-attendance-options flex gap-2">
                    <label className={`rsvp-attendance-option flex-1 py-2.5 text-center transition-all duration-300 font-label ${attendance === "hadir" ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="attendance"
                        value="hadir"
                        checked={attendance === "hadir"}
                        onChange={() => setAttendance("hadir")}
                      />
                      Hadir
                    </label>
                    <label className={`rsvp-attendance-option flex-1 py-2.5 text-center transition-all duration-300 font-label ${attendance === "tidak_hadir" ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="attendance"
                        value="tidak_hadir"
                        checked={attendance === "tidak_hadir"}
                        onChange={() => setAttendance("tidak_hadir")}
                      />
                      Tidak Hadir
                    </label>
                  </div>
                </fieldset>

                {/* Pax */}
                {attendance === "hadir" && (
                  <motion.div initial={false} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-2">
                    <label className="type-label">Jumlah Tamu</label>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setPax(Math.max(1, pax - 1))} aria-label="Kurangi jumlah tamu" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>−</button>
                      <span className="font-display" style={{ color: "var(--accent)", fontWeight: 500, fontSize: "clamp(20px, 5vw, 26px)", minWidth: "1.5ch", textAlign: "center" }}>{pax}</span>
                      <button type="button" onClick={() => setPax(Math.min(5, pax + 1))} aria-label="Tambah jumlah tamu" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>+</button>
                    </div>
                  </motion.div>
                )}

                {/* Message */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="rsvp-message" className="type-label">Ucapan (opsional)</label>
                  <textarea
                    id="rsvp-message"
                    name="message"
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
                    className="input-bloom overflow-hidden resize-none"
                    maxLength={500}
                    rows={1}
                    style={{ minHeight: "40px" }}
                  />
                </div>

                <p role="status" aria-live="polite" className="rsvp-status" style={{ minHeight: "1.5em", color: "var(--accent)", fontSize: 12, textAlign: "center" }}>
                  {loading ? "Mengirim konfirmasi..." : ""}
                </p>

                <div className="flex justify-center pt-2">
                  <button type="submit" disabled={loading || !name.trim() || !attendance} className="btn-bloom" style={{ opacity: (!name.trim() || !attendance) ? 0.45 : 1 }}>
                    {loading ? "Mengirim..." : "Kirim Konfirmasi"}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
