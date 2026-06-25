const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;
const FLOWERS = [
  `${BASE}/BungaJatuh1.webp`,
  `${BASE}/BungaJatuh2.webp`,
  `${BASE}/BungaJatuh3.webp`,
  `${BASE}/BungaJatuh4.webp`,
  `${BASE}/BungaJatuh5.webp`,
  `${BASE}/BungaJatuh6.webp`,
];

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function FallingFlowers({ count = 20, zIndex = 3 }: { count?: number; zIndex?: number }) {
  const petals = Array.from({ length: count }, (_, i) => ({
    id: i,
    src: FLOWERS[i % FLOWERS.length],
    left: `${(sr(i * 7 + 1) * 92 + 2).toFixed(2)}%`,
    width: Math.round(26 + sr(i * 13 + 2) * 38),
    duration: `${(6 + sr(i * 17 + 3) * 9).toFixed(1)}s`,
    delay: `${-(sr(i * 19 + 4) * 14).toFixed(1)}s`,
    rotStart: `${Math.round(sr(i * 11 + 5) * 360)}deg`,
    sway: `${Math.round(18 + sr(i * 23 + 6) * 42)}px`,
  }));

  return (
    <>
      {petals.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          aria-hidden="true"
          className="petal-fall"
          style={{
            left: p.left,
            width: p.width,
            zIndex,
            animationDuration: p.duration,
            animationDelay: p.delay,
            "--petal-rot-start": p.rotStart,
            "--petal-sway": p.sway,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
