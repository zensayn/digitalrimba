"use client";

import Image from "next/image";

// ─── CoreFeatures ─────────────────────────────────────────────────────────────
// A static marketing section with three gradient cards.
// No animations, no hover effects — purely visual.
// Colours sourced from frontend/design-template/cohere/DESIGN.md

export default function CoreFeatures() {
  return (
    <section className="w-full bg-white flex justify-center" style={{ padding: "80px 20px" }}>
      <div className="w-full max-w-[1100px] text-center">

        {/* ── Header ────────────────────────────────────────────────── */}
        <p
          className="text-md font-regular uppercase mb-3 font-poppins"
          style={{
            background: "linear-gradient(90deg, #003c33, #346739, #7dc57f)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Fitur Utama
        </p>

        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[#212121] font-poppins mb-4 text-center"
          style={{ fontSize: "2.75rem", letterSpacing: "-0.02em" }}
        >
          Dirancang untuk Detail &amp; Kualitas
        </h2>

        <p
          className="text-lg text-[#616161] mb-[50px] font-poppins"
          style={{ lineHeight: 1.5 }}
        >
          Setiap proses, dari konsep hingga
          <br />
          undangan tercetak di tangan Anda.
        </p>

        {/* ── Grid ──────────────────────────────────────────────────── */}
        <div className="c1-grid">

          {/* ─ Card 1: Smart Prompt Suggestions ─────────────────────── */}
          <div className="c1-card c1-card-1 shadow-card-lift">
            {/* Prompt box */}
            <div className="c1-prompt-box font-poppins">
              Undangan pernikahan adat dengan{" "}
              <span className="c1-blur-text">foil emas</span> dan{" "}
              <span className="c1-blur-text">emboss bunga</span>{" "}
              <span className="c1-blur-text">di atas kertas</span> cotton
              krem 300gsm.
            </div>

            {/* Add more details pill */}
            <div className="c1-add-pill font-poppins">
              <span style={{ color: "#346739", fontSize: "1rem" }}>✦</span>
              Tambahkan detail
            </div>

            {/* Cursor */}
            <svg className="c1-cursor" width="24" height="24" viewBox="0 0 24 24" fill="#212121" stroke="white" strokeWidth="1">
              <path d="M4 2L20 11L11 13L9 22L4 2Z" />
            </svg>

            <h3 className="font-poppins font-medium">Kustomisasi Cerdas</h3>
          </div>

          {/* ─ Card 2: API Access ───────────────────────────────────── */}
          <div className="c1-card c1-card-2 shadow-card-lift">
            <div className="c1-api-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="c1-network-img"
                src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/network.svg"
                alt="Diagram jaringan distribusi"
              />
            </div>
            <h3 className="font-poppins font-medium">Pengiriman Terintegrasi</h3>
          </div>

          {/* ─ Card 3: Project Library ──────────────────────────────── */}
          <div className="c1-card c1-card-3 shadow-card-lift">
            {/* Mesh overlay */}
            <div className="c1-mesh" />

            {/* Folder icon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="c1-folder"
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/library%20icon.svg"
              alt="Folder galeri desain"
            />

            {/* Search pill */}
            <div className="c1-search font-poppins">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Cari di galeri
            </div>

            <h3 className="font-poppins font-medium">Galeri Desain</h3>
          </div>
        </div>
      </div>

      {/* ── Scoped styles ──────────────────────────────────────────── */}
      <style jsx>{`
        .c1-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .c1-card {
          border-radius: 22px;
          height: 340px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
          text-align: left;
          background: #ffffff; /* canvas */
          border: 1px solid #f2f2f2; /* card-border */
        }

        .c1-card h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #212121; /* ink */
          padding: 24px;
          position: relative;
          z-index: 2;
        }

        /* ─ Card 1 ─ soft mint top → sage midtone → white ────────── */
        .c1-card-1 {
          background: radial-gradient(
            circle at 50% 0%,
            #d0f0cc 0%,
            #a8d8a8 35%,
            #ffffff 75%
          );
        }

        .c1-prompt-box {
          position: absolute;
          top: 30px;
          left: 24px;
          right: 24px;
          background: white;
          border-radius: 12px;
          padding: 16px;
          font-size: 0.8rem;
          color: #616161; /* body-muted */
          line-height: 1.6;
          box-shadow: 0 8px 20px rgba(33, 33, 33, 0.04);
          z-index: 2;
        }

        .c1-blur-text {
          font-weight: 600;
          background: linear-gradient(90deg, #003c33, #5a9e5d); /* deep forest → medium green */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .c1-add-pill {
          position: absolute;
          top: 180px;
          left: 40px;
          background: white;
          border: 1px solid #212121;
          padding: 5px 14px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #212121;
          box-shadow: 0 4px 15px rgba(33, 33, 33, 0.08);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 3;
        }

        .c1-cursor {
          position: absolute;
          top: 205px;
          left: 110px;
          z-index: 10;
          filter: drop-shadow(0 4px 6px rgba(33, 33, 33, 0.2));
        }

        /* ─ Card 2 ─ deep forest top → rich emerald midtone → white ─ */
        .c1-card-2 {
          background: radial-gradient(
            circle at 50% 0%,
            #003c33 0%,
            #145c3a 40%,
            #ffffff 80%
          );
        }

        .c1-api-visual {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
        }

        .c1-network-img {
          width: 100%;
          height: 180px;
          object-fit: contain;
          margin-top: 20px;
        }

        /* ─ Card 3 ─ primary green top → pale green wash → white ──── */
        .c1-card-3 {
          background: radial-gradient(
            circle at 50% 0%,
            #346739 0%,
            #c5e8c2 40%,
            #ffffff 80%
          );
        }

        .c1-mesh {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
          background-size: 16px 16px;
          -webkit-mask-image: radial-gradient(circle at center top, black 0%, transparent 80%);
          mask-image: radial-gradient(circle at center top, black 0%, transparent 80%);
        }

        .c1-folder {
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          width: 170px;
          filter: drop-shadow(0 15px 25px rgba(33, 33, 33, 0.08));
          z-index: 2;
        }

        .c1-search {
          position: absolute;
          top: 220px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid #212121;
          padding: 6px 18px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #212121;
          box-shadow: 0 8px 20px rgba(33, 33, 33, 0.06);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 3;
        }

        /* ─ Responsive ─────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .c1-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .c1-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
