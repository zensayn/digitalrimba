import Link from "next/link";

// ─── 404 Not Found ────────────────────────────────────────────────────────────
// Single full-viewport page (no scroll). Server Component — all hover and
// motion is CSS only. Palette and rounding follow design-template/cohere/DESIGN.md;
// motion choices follow .agents/skills/emil-design-eng/SKILL.md.

const CLOUD_GRADIENT_ID = "rf-404-cloud-gradient";
const HEART_GRADIENT_ID = "rf-404-heart-gradient";

export default function NotFound() {
  return (
    <div className="rf-404 fixed inset-0 z-[9999] overflow-hidden bg-white text-[#212121] font-poppins flex flex-col">
      {/* ─── Navbar (matches site Header.tsx) ────────────────────────── */}
      <nav className="rf-404__nav relative w-full">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between py-7 px-6 md:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold tracking-tight text-lg md:text-xl text-[#212121] hover:opacity-85 transition-opacity"
          >
            RIMBA FISIK
          </Link>

          {/* Center menu */}
          <ul className="hidden md:flex items-center gap-9 text-sm text-[#212121]/65">
            <li className="cursor-pointer hover:text-[#212121] transition-colors">
              Produk
            </li>
            <li className="cursor-pointer hover:text-[#212121] transition-colors">
              Harga
            </li>
            <li className="cursor-pointer hover:text-[#212121] transition-colors">
              Galeri
            </li>
            <li className="cursor-pointer hover:text-[#212121] transition-colors">
              Tentang
            </li>
          </ul>

          {/* CTA */}
          <Link
            href="/"
            className="hidden md:inline-flex items-center bg-[#212121] text-white rounded-full pl-2 pr-5 py-1.5 gap-2.5 hover:bg-[#346739] transition-colors group"
          >
            <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white -rotate-45 transition-transform duration-200 group-hover:rotate-0"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-sm">Konsultasi</span>
          </Link>
        </div>

        {/* Dashed bottom border */}
        <div
          aria-hidden="true"
          className="max-w-[1100px] mx-auto h-px"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px)",
            backgroundSize: "6px 1px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </nav>

      {/* ─── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center w-full px-5 pb-8">
        <div className="w-full max-w-[700px] flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="text-[15px] text-[#93939f] mb-3">
            Sepertinya Anda tersesat&hellip;
          </p>

          {/* Title with floating decorations */}
          <div className="relative inline-block mb-3">
            {/* Cloud (top-left) */}
            <span
              aria-hidden="true"
              className="rf-404__cloud absolute"
              style={{ top: "-20px", left: "-28px" }}
            >
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill={`url(#${CLOUD_GRADIENT_ID})`}
                style={{ filter: "drop-shadow(0 0 1.5px #ffffff)" }}
              >
                <defs>
                  <linearGradient
                    id={CLOUD_GRADIENT_ID}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="50%" stopColor="#edfce9" />
                    <stop offset="80%" stopColor="#defce1" />
                    <stop offset="100%" stopColor="#edfde9" />
                  </linearGradient>
                </defs>
                <path d="M19 18H7a4 4 0 0 1-.6-7.96 5.5 5.5 0 0 1 10.55-1.6A4.5 4.5 0 0 1 19 18Z" />
              </svg>
            </span>

            {/* Heart (bottom-right) */}
            <span
              aria-hidden="true"
              className="rf-404__heart absolute"
              style={{ bottom: "-18px", right: "20px" }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill={`url(#${HEART_GRADIENT_ID})`}
                style={{ filter: "drop-shadow(0 0 1.5px #ffffff)" }}
              >
                <defs>
                  <linearGradient
                    id={HEART_GRADIENT_ID}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffad9b" />
                    <stop offset="55%" stopColor="#ff7759" />
                    <stop offset="100%" stopColor="#ff7000" />
                  </linearGradient>
                </defs>
                <path d="M12 21s-7-4.35-9.5-9a5.5 5.5 0 0 1 9.5-5 5.5 5.5 0 0 1 9.5 5C19 16.65 12 21 12 21Z" />
              </svg>
            </span>

            <h1
              className="font-medium text-[#212121] leading-[1.08]"
              style={{
                fontSize: "clamp(34px, 5vw, 52px)",
                letterSpacing: "-0.03em",
              }}
            >
              Halaman tidak ditemukan
            </h1>
          </div>

          {/* Subtext with brand chips */}
          <p
            className="text-sm text-[#616161] max-w-[480px] mb-7"
            style={{ lineHeight: 1.7 }}
          >
            Mungkin halaman ini sudah dipindahkan. Mulai sesi{" "}
            <span className="inline-flex items-center bg-[#edfce9] text-[#346739] text-[12.5px] font-semibold px-3 py-0.5 rounded-md align-baseline">
              konsultasi
            </span>{" "}
            singkat untuk membahas konsep undangan Anda dan tim kami akan bantu{" "}
            <span className="inline-flex items-center bg-[#edfce9] text-[#346739] text-[12.5px] font-semibold px-3 py-0.5 rounded-md align-baseline">
              desain
            </span>{" "}
            sesuai visi Anda.
          </p>

          {/* Navigation cards */}
          <div className="w-full max-w-[460px] mt-auto flex flex-col gap-3">
            {/* Card 1: Beranda */}
            <Link
              href="/"
              className="rf-404__card group flex items-center justify-between bg-white border border-[#f2f2f2] rounded-[22px] py-4 px-5 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[#346739]/30 shadow-card-lift hover:shadow-card-lift-hover"
            >
              <div className="flex items-center gap-3.5">
                <span className="rf-404__card-icon w-12 h-12 rounded-full bg-[#eaecf0] flex items-center justify-center transition-transform duration-200 ease-out">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#212121"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
                    <path d="M9 21V12h6v9" stroke="white" />
                  </svg>
                </span>
                <span className="flex flex-col items-start text-left">
                  <span className="text-[15px] font-semibold text-[#212121] leading-tight">
                    Beranda
                  </span>
                  <span className="text-xs text-[#93939f] mt-0.5">
                    Kembali ke halaman utama
                  </span>
                </span>
              </div>
              <span className="rf-404__chevron text-[#93939f] text-[21px] leading-none transition-transform duration-200 ease-out">
                ›
              </span>
            </Link>

            {/* Card 2: Galeri */}
            <Link
              href="/"
              className="rf-404__card group flex items-center justify-between bg-white border border-[#f2f2f2] rounded-[22px] py-4 px-5 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[#346739]/30 shadow-card-lift hover:shadow-card-lift-hover"
            >
              <div className="flex items-center gap-3.5">
                <span className="rf-404__card-icon w-12 h-12 rounded-full bg-[#eaecf0] flex items-center justify-center transition-transform duration-200 ease-out">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#212121" />
                    <circle cx="12" cy="12" r="3.5" fill="white" />
                  </svg>
                </span>
                <span className="flex flex-col items-start text-left">
                  <span className="text-[15px] font-semibold text-[#212121] leading-tight">
                    Galeri Desain
                  </span>
                  <span className="text-xs text-[#93939f] mt-0.5">
                    Lihat karya cetak terbaru kami
                  </span>
                </span>
              </div>
              <span className="rf-404__chevron text-[#93939f] text-[21px] leading-none transition-transform duration-200 ease-out">
                ›
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Animations ──────────────────────────────────────────────── */}
      {/* Float animation only when user has not requested reduced motion (Emil's accessibility rule). */}
      <style>{`
        .rf-404__cloud { animation: rf404Float 5s ease-in-out 0.3s infinite; }
        .rf-404__heart { animation: rf404Float 4.5s ease-in-out 1s infinite; }

        .rf-404__card:hover .rf-404__card-icon { transform: scale(1.05); }
        .rf-404__card:hover .rf-404__chevron { transform: translateX(6px); }

        @keyframes rf404Float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(3deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .rf-404__cloud,
          .rf-404__heart {
            animation: none;
          }
          .rf-404__card,
          .rf-404__card-icon,
          .rf-404__chevron {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
