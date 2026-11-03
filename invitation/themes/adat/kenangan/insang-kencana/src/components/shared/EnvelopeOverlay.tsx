"use client";

// Amplop pembuka 3D — port persis dari warm-narrative/EnvelopeOverlay (seragam
// dengan pavilion-romance): empat flap segitiga (satu gambar dirotasi 4×)
// terbuka berurutan dengan stempel lilin di tengah. Ketuk di mana pun =
// gesture pengguna → event `invitation-open` di-dispatch (MusicPlayer boleh
// autoplay) + onOpen() memberi tahu InvitationExperience untuk melepas
// inert/aria-hidden konten. Aset flap & stempel ada di R2 soft-bloom dan
// public/images (fallback dev tanpa env).

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

const EASE = [0.23, 1, 0.32, 1] as const;
const EASE_STRING = "cubic-bezier(0.23, 1, 0.32, 1)";

export default function EnvelopeOverlay({ onOpen }: { onOpen?: () => void }) {
  const [phase, setPhase] = useState<"closed" | "opening" | "dismiss">("closed");
  const [gone, setGone] = useState(false);
  const originalOverflow = useRef<string | null>(null);

  const open = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    // Dispatch DI DALAM handler gesture → audio.play() lolos autoplay policy
    document.dispatchEvent(new CustomEvent("invitation-open"));
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    onOpen?.();
  };

  // Safety net: iOS Safari can drop transitionend (app switch, gesture
  // interruption), which would leave the overlay stuck in "opening" with the
  // page unreachable until a refresh. The flaps finish at ~1.9s (0.9s delay +
  // 1.0s duration); if the event hasn't arrived well past that, force dismiss.
  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(() => setPhase("dismiss"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  // Prevent scroll ONLY when the envelope is closed. Unlock it immediately upon tapping open.
  // Restores whatever overflow value was on body before we touched it, instead of assuming "".
  useEffect(() => {
    if (originalOverflow.current === null) {
      originalOverflow.current = document.body.style.overflow;
    }
    document.body.style.overflow = phase === "closed" ? "hidden" : originalOverflow.current;
    return () => {
      document.body.style.overflow = originalOverflow.current ?? "";
    };
  }, [phase]);

  if (gone) return null;

  const opened = phase !== "closed";

  return (
    <motion.div
      role="button"
      aria-label="Ketuk untuk membuka undangan"
      tabIndex={phase === "closed" ? 0 : -1}
      onClick={open}
      // iOS Safari batalkan event click bila jari bergeser sedikit saat tap
      // (apalagi dengan body scroll terkunci) — touchend tetap terkirim, jadi
      // jadikan fallback; open() sudah di-guard sehingga double-fire aman.
      onTouchEnd={() => {
        if (phase === "closed") open();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      animate={{ opacity: phase === "dismiss" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      onAnimationComplete={() => {
        if (phase === "dismiss") setGone(true);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: phase === "closed" ? "pointer" : "default",
        overflow: "hidden",
        perspective: "1400px", // Parent perspective context for translating child container in 3D
        transformStyle: "preserve-3d",
        // Instantly release pointer events once opening, so the user can interact with the card underneath immediately
        pointerEvents: phase === "closed" ? "auto" : "none",
      }}
    >
      {/* Background Overlay: GPU-accelerated CSS transition */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg)",
          zIndex: 1,
          pointerEvents: "none",
          opacity: opened ? 0 : 1,
          transition: `opacity 0.8s ${EASE_STRING}`,
        }}
      />

      <div
        style={{
          position: "relative",
          width: "150vmax", // Sized up to 150vmax to push the 13% image transparent base margins completely off-screen
          height: "150vmax",
          flexShrink: 0,
          perspective: "1400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          transform: "translateZ(-150px)", // Translated back by -150px for deep 3D perspective
          transformStyle: "preserve-3d",
        }}
      >
        {/* Triangle Cards forming the envelope flaps with explicit zIndex stacking and customized opening order (Above, Below, Right, Left) */}
        {[
          { id: 1, rotation: 0, zIndex: 11, delay: 0.9, shadow: "0px 8px 12px var(--flap-shadow)" },
          { id: 2, rotation: 90, zIndex: 13, delay: 0.3, shadow: "8px 0px 12px var(--flap-shadow)" },
          { id: 3, rotation: 180, zIndex: 12, delay: 0.7, shadow: "0px -8px 12px var(--flap-shadow)" },
          { id: 4, rotation: 270, zIndex: 14, delay: 0.5, shadow: "-8px 0px 12px var(--flap-shadow)" },
        ].map(({ id, rotation, zIndex, delay, shadow }) => (
          <div
            key={id}
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center center",
              pointerEvents: "none",
              zIndex: zIndex,
            }}
          >
            {/* GPU-accelerated CSS 3D Rotation */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                transform: opened ? "rotateY(-180deg)" : "rotateY(0deg)",
                transition: opened
                  ? `transform 1.0s ${EASE_STRING} ${delay}s`
                  : `transform 0.4s ${EASE_STRING}`,
              }}
              onTransitionEnd={(e) => {
                // Left flap (id === 1) is the last to transition in the new delay order, so it triggers dismissal
                if (e.propertyName === "transform" && id === 1 && phase === "opening") {
                  setPhase("dismiss");
                }
              }}
            >
              <img
                src={asset("AmplopFlapLeft.webp")}
                alt=""
                aria-hidden="true"
                onError={hideBrokenImage}
                style={{
                  position: "absolute",
                  left: "-8.9%",
                  width: "68.3%",
                  top: "-4.9%",
                  height: "112%",
                  objectFit: "fill",
                  filter: `drop-shadow(${shadow})`,
                }}
              />
            </div>
          </div>
        ))}

        {/* Stempel lilin (Wax seal) centered wrapper */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${opened ? 0.8 : 1})`,
            width: "min(46vw, 220px)",
            zIndex: 20,
            pointerEvents: "none",
            opacity: opened ? 0 : 1,
            transition: `opacity 0.4s ${EASE_STRING}, transform 0.4s ${EASE_STRING}`,
          }}
        >
          <img
            src={asset("StempelAmplop.webp")}
            alt=""
            aria-hidden="true"
            onError={hideBrokenImage}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              filter: "drop-shadow(0 3px 6px var(--seal-shadow)) drop-shadow(0 1px 3px var(--seal-shadow-soft))",
            }}
          />
        </div>
      </div>

      <motion.span
        className="font-label"
        animate={{ opacity: opened ? 0 : [0, 0.7, 0] }}
        transition={
          opened
            ? { duration: 0.3 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          position: "absolute",
          bottom: "calc(48px + env(safe-area-inset-bottom))",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "10px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--accent)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        Ketuk untuk membuka
      </motion.span>
    </motion.div>
  );
}
