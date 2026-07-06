"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import ParallaxScene from "@/components/shared/ParallaxScene";
import { sceneFrame } from "@/components/shared/sceneFrame";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

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

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.8, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="rsvp" className="snap-section" style={{ background: "transparent" }}>
      {/* Gallery above stays contained (small sprigs), so we keep our top
          frame; our corner pieces overhang into Gift. */}
      <ParallaxScene
        layers={sceneFrame({ base: BASE, bg: `${BASE}/RSVPBg.webp`, variant: 1, density: "light", base_clusters: false, seam: "overhang" })}
      />
      <div className="paper-overlay" />

      <div
        ref={ref}
        data-prevent-snap="true"
        className="relative z-10 w-full mx-auto px-8 overflow-y-auto"
        style={{
          maxWidth: "400px",
          maxHeight: "100svh",
          paddingTop: "clamp(32px, 7vh, 72px)",
          paddingBottom: "clamp(32px, 7vh, 72px)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-deep)", marginBottom: 4, textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
          >
            Konfirmasi Kehadiran
          </motion.p>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{
              fontSize: "clamp(30px, 9vw, 44px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--gold)",
              marginBottom: "clamp(20px, 5vh, 36px)",
            }}
          >
            RSVP
          </motion.h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--gold)",
                }}
              >
                <Check size={20} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <p
                className="font-display"
                style={{ color: "var(--gold)", fontSize: "clamp(18px, 5vw, 22px)", fontStyle: "italic" }}
              >
                Terima Kasih
              </p>
              <p
                className="font-body"
                style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic", lineHeight: 1.8 }}
              >
                Konfirmasi Anda telah kami terima.<br />
                Kami sangat menantikan kehadiran Anda.
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
                <label
                  className="font-label"
                  style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
                >
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="input-warm"
                  required
                />
              </div>

              {/* Attendance */}
              <div className="flex flex-col gap-2">
                <label
                  className="font-label"
                  style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
                >
                  Konfirmasi
                </label>
                <div className="flex gap-2">
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAttendance(opt)}
                      className="flex-1 py-2.5 text-center transition-all duration-300 font-label"
                      style={{
                        border: `1px solid ${attendance === opt ? "var(--gold)" : "var(--border)"}`,
                        color: attendance === opt ? "var(--gold)" : "var(--text-muted)",
                        background: attendance === opt ? "rgba(192,120,48,0.08)" : "rgba(250,247,242,0.65)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-2"
                >
                  <label
                    className="font-label"
                    style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
                  >
                    Jumlah Tamu
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}
                    >
                      −
                    </button>
                    <span
                      className="font-display"
                      style={{ color: "var(--gold)", fontWeight: 400, fontSize: "clamp(20px, 5vw, 26px)", minWidth: "1.5ch", textAlign: "center" }}
                    >
                      {pax}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPax(Math.min(5, pax + 1))}
                      style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label
                  className="font-label"
                  style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)" }}
                >
                  Ucapan (opsional)
                </label>
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
                  placeholder="Tuliskan ucapan selamat..."
                  className="input-warm overflow-hidden resize-none"
                  rows={1}
                  style={{ minHeight: "40px" }}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading || !name || !attendance}
                  className="btn-warm"
                  style={{ opacity: (!name || !attendance) ? 0.45 : 1 }}
                >
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
