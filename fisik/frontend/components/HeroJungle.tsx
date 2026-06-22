"use client";

export default function HeroJungle() {
  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">

      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, #e8f5e0 0%, #c8eabc 18%, #a0d890 36%, #72c264 54%, #4cad50 68%, #346739 100%)"
      }} />

      {/* Hill layer 1 — back, lightest */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "52%",
        background: "#4cad50",
        borderRadius: "65% 75% 0 0 / 28% 32% 0 0",
        transform: "scaleX(1.25) translateX(-5%)",
      }} />

      {/* Hill layer 2 — mid-left */}
      <div className="absolute bottom-0" style={{
        left: "-15%",
        right: "25%",
        height: "44%",
        background: "#3d9443",
        borderRadius: "70% 55% 0 0 / 35% 22% 0 0",
      }} />

      {/* Hill layer 3 — mid-right */}
      <div className="absolute bottom-0" style={{
        left: "20%",
        right: "-20%",
        height: "40%",
        background: "#48a04e",
        borderRadius: "55% 68% 0 0 / 20% 38% 0 0",
      }} />

      {/* Hill layer 4 — front-left, darkest */}
      <div className="absolute bottom-0" style={{
        left: "-5%",
        right: "45%",
        height: "34%",
        background: "#346739",
        borderRadius: "60% 80% 0 0 / 40% 25% 0 0",
      }} />

      {/* Hill layer 5 — front-right, darkest */}
      <div className="absolute bottom-0" style={{
        left: "38%",
        right: "-10%",
        height: "30%",
        background: "#2d5a30",
        borderRadius: "75% 50% 0 0 / 30% 40% 0 0",
      }} />

      {/* Ground strip */}
      <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "#2d5a30" }} />

      {/* Flora dots — left cluster */}
      <div className="absolute" style={{ bottom: "30%", left: "8%", width: 40, height: 40, background: "#1e3d21", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "33%", left: "11%", width: 26, height: 26, background: "#163019", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "31%", left: "5%", width: 20, height: 20, background: "#234d25", borderRadius: "50%" }} />

      {/* Flora dots — right cluster */}
      <div className="absolute" style={{ bottom: "27%", right: "10%", width: 44, height: 44, background: "#1e3d21", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "30%", right: "14%", width: 28, height: 28, background: "#163019", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "28%", right: "7%", width: 22, height: 22, background: "#234d25", borderRadius: "50%" }} />

      {/* Flora dots — center cluster */}
      <div className="absolute" style={{ bottom: "25%", left: "45%", width: 32, height: 32, background: "#163019", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "27%", left: "50%", width: 22, height: 22, background: "#1e3d21", borderRadius: "50%" }} />

      {/* Flower accents */}
      <div className="absolute" style={{ bottom: "28%", left: "22%", width: 8, height: 8, background: "#ff7759", borderRadius: "50%", boxShadow: "0 0 6px #ff7759" }} />
      <div className="absolute" style={{ bottom: "26%", left: "35%", width: 6, height: 6, background: "#ffad9b", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "29%", right: "28%", width: 8, height: 8, background: "#ff7759", borderRadius: "50%", boxShadow: "0 0 6px #ff7759" }} />
      <div className="absolute" style={{ bottom: "27%", right: "42%", width: 6, height: 6, background: "#edfce9", borderRadius: "50%" }} />
      <div className="absolute" style={{ bottom: "24%", left: "58%", width: 7, height: 7, background: "#ffad9b", borderRadius: "50%" }} />

      {/* Placeholder content — centered above hills */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-28 px-6 text-center z-10">
        <p className="text-sm font-medium uppercase tracking-widest text-[#346739] mb-4">
          — Rimba Fisik —
        </p>
        <h1 className="text-6xl md:text-8xl font-normal tracking-tight text-[#212121] leading-none">
          Crafted by hand.<br />Felt in person.
        </h1>
        <p className="mt-6 text-base text-[#212121]/60 font-poppins max-w-md">
          Undangan pernikahan cetak premium — dari kertas pilihan hingga foil emas, setiap detail terasa nyata.
        </p>
      </div>

    </div>
  );
}
