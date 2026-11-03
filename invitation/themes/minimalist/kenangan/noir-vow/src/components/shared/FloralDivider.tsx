"use client";

// Pembatas horizontal: garis tipis + diamond kecil di tengah.

export default function FloralDivider({
  width = "60vw",
  maxWidth = 280,
  style,
}: {
  width?: string;
  maxWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        maxWidth,
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--accent-line)" }} />
      <div style={{ width: 6, height: 6, background: "var(--accent-line)", transform: "rotate(45deg)", flexShrink: 0 }} />
      <div style={{ flex: 1, height: 1, background: "var(--accent-line)" }} />
    </div>
  );
}
