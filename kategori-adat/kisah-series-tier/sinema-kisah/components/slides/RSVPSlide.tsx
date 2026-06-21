"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";

export default function RSVPSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | null>(null);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="slide-page" style={{ background: "var(--surface)" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{ width: "100%", height: "100dvh", paddingBottom: "var(--pb-safe)" }}
      >
        <div style={{ padding: "var(--pt-slide) clamp(32px, 9vw, 52px) 0" }}>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 8,
            }}
          >
            Konfirmasi Kehadiran
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{ fontStyle: "italic", fontSize: "clamp(28px, 8vw, 40px)", color: "var(--gold)", marginBottom: 32 }}
          >
            RSVP
          </motion.h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 32 }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: "1px solid var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={20} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <p className="font-display" style={{ fontStyle: "italic", color: "var(--gold)", fontSize: 22 }}>
                Terima Kasih
              </p>
              <p
                className="font-body"
                style={{
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  lineHeight: 1.8,
                  textAlign: "center",
                }}
              >
                Konfirmasi Anda telah kami terima.
                <br />
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
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  className="font-label"
                  style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}
                >
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="input-amber"
                  required
                />
              </div>

              {/* Attendance */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  className="font-label"
                  style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}
                >
                  Konfirmasi
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAttendance(opt)}
                      className="font-label"
                      style={{
                        flex: 1,
                        padding: "12px 8px",
                        border: `1px solid ${attendance === opt ? "var(--gold)" : "var(--border)"}`,
                        background: attendance === opt ? "var(--gold)" : "transparent",
                        color: attendance === opt ? "var(--bg)" : "var(--text-dim)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.2s",
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
                  style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}
                >
                  <label
                    className="font-label"
                    style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}
                  >
                    Jumlah Tamu
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <button
                      type="button"
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      style={{
                        width: 32,
                        height: 32,
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 18,
                      }}
                    >
                      −
                    </button>
                    <span
                      className="font-display"
                      style={{ color: "var(--gold)", fontSize: 28, minWidth: "1.5ch", textAlign: "center" }}
                    >
                      {pax}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPax(Math.min(5, pax + 1))}
                      style={{
                        width: 32,
                        height: 32,
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 18,
                      }}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  className="font-label"
                  style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}
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
                  className="input-amber overflow-hidden resize-none"
                  rows={1}
                  style={{ minHeight: 40 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name || !attendance}
                className="font-label"
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "var(--gold)",
                  color: "var(--bg)",
                  border: "none",
                  cursor: !name || !attendance ? "not-allowed" : "pointer",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  opacity: !name || !attendance ? 0.45 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
