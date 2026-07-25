"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import SectionHeader from "@/components/shared/SectionHeader";
import { kelirFor } from "@/components/shared/sceneKelir";

export default function RSVPSection() {
  const preset = kelirFor("rsvp");
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
    // Mock — belum ada backend (paritas dengan warm-narrative).
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent scroll maxWidth={340}>
          <SectionHeader eyebrow="Konfirmasi Kehadiran" title="RSVP" />

          {submitted ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-6">
              <span
                style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--gold)" }}
              >
                <Check size={20} color="var(--gold)" strokeWidth={1.5} />
              </span>
              <p className="font-display" style={{ color: "var(--gold)", fontSize: "clamp(18px, 5vw, 22px)" }}>Terima Kasih</p>
              <p className="font-body leading-relaxed text-[var(--text-muted)]" style={{ fontSize: 13 }}>
                Konfirmasi Anda telah kami terima. Kami menantikan kehadiran Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-5 text-left">
              <div className="flex flex-col gap-1">
                <label className="font-label" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="input-gold"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Konfirmasi
                </label>
                <div className="flex gap-2">
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAttendance(opt)}
                      className="font-label flex-1 py-2.5 text-center"
                      style={{
                        border: `1px solid ${attendance === opt ? "var(--gold)" : "var(--border)"}`,
                        color: attendance === opt ? "var(--gold)" : "var(--text-muted)",
                        background: attendance === opt ? "rgba(201,162,39,0.1)" : "transparent",
                        fontSize: 10,
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

              {attendance === "hadir" && (
                <div className="flex flex-col gap-2">
                  <label className="font-label" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Jumlah Tamu
                  </label>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setPax(Math.max(1, pax - 1))} style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                      −
                    </button>
                    <span className="font-display" style={{ color: "var(--gold)", fontSize: "clamp(20px, 5vw, 26px)", minWidth: "1.5ch", textAlign: "center" }}>
                      {pax}
                    </span>
                    <button type="button" onClick={() => setPax(Math.min(5, pax + 1))} style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-label" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
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
                  className="input-gold resize-none overflow-hidden"
                  rows={1}
                  style={{ minHeight: 40 }}
                />
              </div>

              <div className="flex justify-center pt-1">
                <button type="submit" disabled={loading || !name || !attendance} className="btn-gold" style={{ opacity: !name || !attendance ? 0.45 : 1 }}>
                  {loading ? "Mengirim..." : "Kirim Konfirmasi"}
                </button>
              </div>
            </form>
          )}
        </SceneContent>
      </KelirScene>
    </section>
  );
}
