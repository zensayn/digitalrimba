"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import TwilightTitle from "@/components/shared/TwilightTitle";
import SectionCastleDecor from "@/components/shared/SectionCastleDecor";
import Stardust from "@/components/shared/Stardust";
import SceneBackground from "@/components/shared/SceneBackground";

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
    <section id="rsvp" className="snap-section flow-section reveal-scope">
      <SceneBackground scrim={0.42} edgeFade />
      <Stardust count={16} />
      <SectionCastleDecor />

      <div
        ref={ref}
        className="relative z-10 w-full mx-auto px-6"
        style={{
          maxWidth: "396px",
          paddingTop: "clamp(48px, 9vh, 92px)",
          paddingBottom: "clamp(48px, 9vh, 92px)",
        }}
      >
        <div className="bloom-panel flex flex-col items-center text-center" style={{ padding: "clamp(30px, 8vw, 40px)" }}>
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
            <TwilightTitle serif>RSVP</TwilightTitle>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-8">
              <div style={{ width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent)" }}>
                <Check size={24} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <p className="font-display" style={{ color: "var(--text)", fontSize: "clamp(22px, 5.8vw, 28px)", fontWeight: 500, fontStyle: "italic" }}>Terima Kasih</p>
              <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.8, fontWeight: 300 }}>
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
                <label className="type-label">Nama Tamu</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" className="input-bloom" required />
              </div>

              {/* Attendance */}
              <div className="flex flex-col gap-2">
                <label className="type-label">Konfirmasi</label>
                <div className="flex gap-2">
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAttendance(opt)}
                      aria-pressed={attendance === opt}
                      className="flex-1 py-2.5 text-center transition-all duration-300 font-label"
                      style={{
                        border: `1px solid ${attendance === opt ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 4,
                        color: attendance === opt ? "var(--accent)" : "var(--text-muted)",
                        background: attendance === opt ? "rgba(212,175,55,0.10)" : "transparent",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
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
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setPax(Math.max(1, pax - 1))} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 22 }}>−</button>
                    <span className="font-display" style={{ color: "var(--accent)", fontWeight: 500, fontSize: "clamp(24px, 6vw, 32px)", minWidth: "1.5ch", textAlign: "center" }}>{pax}</span>
                    <button type="button" onClick={() => setPax(Math.min(5, pax + 1))} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 22 }}>+</button>
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
                  className="input-bloom overflow-hidden resize-none"
                  rows={1}
                  style={{ minHeight: "40px" }}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button type="submit" disabled={loading || !name || !attendance} className="btn-bloom" style={{ opacity: (!name || !attendance) ? 0.45 : 1 }}>
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
