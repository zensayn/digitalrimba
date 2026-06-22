"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ArrowRightUp, Eye, AltArrowRight } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";

// Emil Kowalski's custom ease-out curve
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface GalleryItem {
  id: string;
  title: string;
  category: "heartwood" | "timber" | "leaf" | "digital";
  categoryLabel: string;
  imageUrl: string;
  description: string;
  craftDetails: string[];
  specs: {
    paper?: string;
    weight?: string;
    techniques?: string[];
    features?: string[];
  };
}

export default function GalleryPage() {
  const tNav = useTranslations("Navbar");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "heartwood" | "timber" | "leaf" | "digital">("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: "1",
      title: "Royal Forest Heartwood",
      category: "heartwood",
      categoryLabel: "Heartwood (Luxury)",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
      description: "Our crowning achievement. Royal deep green 600gsm heavy organic cotton card with custom brass plate gold foil hot stamping, framed by hand-painted gold bevel edges.",
      craftDetails: [
        "100% heavy cotton handmade paper base",
        "Deep heat-pressed gold foil outlining",
        "Matching envelopes lined with bespoke botanical hand-painted illustration"
      ],
      specs: {
        paper: "Gmund Cotton Max White & Forest",
        weight: "600 GSM (Double-Thick)",
        techniques: ["Gold Hot Stamping", "Bevel Edge Painting", "Custom Monogram Die"]
      }
    },
    {
      id: "2",
      title: "Classic Timber Letterpress",
      category: "timber",
      categoryLabel: "Timber (Artisanal)",
      imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop",
      description: "A gorgeous classic letterpress composition. Hand-fed printing creates a satisfyingly deep bite into 300gsm textured raw cotton paper with natural soy-based matte black ink.",
      craftDetails: [
        "Traditional hand-fed plate press machinery calibration",
        "Textured raw linen lining on matching secure envelope flaps",
        "Crisp modernist typographical formatting"
      ],
      specs: {
        paper: "Wild Cotton Raw Mineral",
        weight: "350 GSM (Textured)",
        techniques: ["Matte Letterpress", "Blind Debossing", "Hand-torn Deckled Edges"]
      }
    },
    {
      id: "3",
      title: "Linen Leaf Debossing",
      category: "leaf",
      categoryLabel: "Leaf (Essential)",
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
      description: "Pure, understated elegance. Minimally structured layout using blind leaf debossing (cetak tenggelam tanpa tinta) over warm stone linen paper. A sensory celebration of texture.",
      craftDetails: [
        "Zero-ink blind debossing for an ultra-clean tactical look",
        "Crisp hairline typographical formatting",
        "Recycled biological envelope with hand-poured sage green wax seal"
      ],
      specs: {
        paper: "Conqueror Laid Warm White",
        weight: "300 GSM",
        techniques: ["Blind Debossing", "Wax Seal Curation"]
      }
    },
    {
      id: "4",
      title: "Minimalist Modernist Heartwood",
      category: "heartwood",
      categoryLabel: "Heartwood (Luxury)",
      imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop",
      description: "Striking editorial card featuring blind debossed grid borders overlaid with a centered high-gloss matte copper hot stamping monogram. High-end modernism.",
      craftDetails: [
        "Symmetrical border lines pressed deeply without ink",
        "Stark typography contrast",
        "Handmade vellum paper overlays with copper gold threads"
      ],
      specs: {
        paper: "Crane's Lettra Soft White",
        weight: "600 GSM",
        techniques: ["Matte Copper Foil", "Deep Blind Grid Press"]
      }
    },
    {
      id: "5",
      title: "Sage & Ivory Timber Bundle",
      category: "timber",
      categoryLabel: "Timber (Artisanal)",
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop",
      description: "A gorgeous layered invitation stack. Includes the main invitation card, details sheet, and RSVP card held together snugly by an elegant paper band and gold thread.",
      craftDetails: [
        "Sage green and raw ivory card color blocking contrast",
        "Traditional letterpress ink distribution",
        "Fully matching printed tags and thread binding"
      ],
      specs: {
        paper: "Gmund Colors Matte Silk",
        weight: "350 GSM",
        techniques: ["Letterpress Ink", "Die-cut Paper Banding"]
      }
    },
    {
      id: "6",
      title: "Tuscany Ochre Digital Suite",
      category: "digital",
      categoryLabel: "Digital (Web & SaaS)",
      imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop",
      description: "A look into the premium digital experience. Clean modernist web design with customized typography, parallax smooth image galleries, and real-time smart WhatsApp RSVP triggers.",
      craftDetails: [
        "Fully responsive layouts styled to match luxury invitation aesthetics",
        "Instant guest-name personalization link engine",
        "Built-in on-site guest entry validator and souvenir manager"
      ],
      specs: {
        features: ["Smart WhatsApp RSVP Notification API", "On-site QR Check-in System", "Custom Wedding Playlist Integrations"]
      }
    }
  ];

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] text-[#212121] font-poppins pt-24 pb-20 overflow-hidden">
      {/* Background Soft Mineral Wash */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#346739]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col mt-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#616161] hover:text-[#212121] transition-colors mb-6 group self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{tNav("ecosystem").split(" ")[0]} Home</span>
          </Link>

          <span className="text-xs font-bold uppercase tracking-wider text-[#346739] mb-2 font-mono">
            {tNav("developers") || "GALLERY EXHIBITION"}
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#212121] max-w-xl leading-tight">
            Curated Keepsake Collections
          </h1>
          <p className="text-[#616161] mt-3 text-base md:text-lg font-light max-w-2xl leading-relaxed">
            Jelajahi keindahan taktil dari letterpress tradisional dan foil logam, bersanding dengan kemudahan teknologi orkestrasi undangan digital modern kami.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#e5e7eb] scrollbar-none">
          {[
            { id: "all", label: "All Collections" },
            { id: "heartwood", label: "Heartwood (Luxury)" },
            { id: "timber", label: "Timber (Artisanal)" },
            { id: "leaf", label: "Leaf (Essential)" },
            { id: "digital", label: "Digital Web" }
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer outline-none ${
                  isSelected 
                    ? "bg-[#212121] text-white shadow-sm scale-102" 
                    : "bg-white border border-[#e5e7eb] text-[#616161] hover:bg-neutral-50 hover:text-[#212121] active:scale-97"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Masonry/Grid of Gallery Cards */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
                className="group relative bg-white border border-[#e5e7eb] rounded-[24px] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                {/* Image Wrap */}
                <div className="w-full h-[240px] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300 z-10" />
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                  />
                  <div className="absolute top-4 left-4 z-20 px-3 py-0.8 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-800 border border-white/20">
                    {item.categoryLabel}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg text-neutral-800 group-hover:text-[#346739] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-normal line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveItem(item)}
                    className="w-full flex items-center justify-center border border-[#e5e7eb] hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 rounded-full py-2.5 gap-2 text-xs font-semibold transition-all active:scale-[0.97]"
                  >
                    <Eye className="w-4 h-4 text-neutral-400" />
                    <span>View Specifications</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox / Specification Modal overlay */}
        <AnimatePresence>
          {activeItem && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              {/* Dim Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveItem(null)}
                className="absolute inset-0 bg-[#000000]/40 backdrop-blur-md"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
                className="relative bg-white border border-[#e5e7eb] rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 z-10 flex flex-col gap-6 scrollbar-none"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors flex items-center justify-center cursor-pointer outline-none border-none text-lg font-bold"
                >
                  ✕
                </button>

                {/* Imagery Banner */}
                <div className="w-full h-[220px] md:h-[260px] rounded-2xl overflow-hidden relative">
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider text-[#346739] border border-white/20">
                    {activeItem.categoryLabel}
                  </div>
                </div>

                {/* Text Body */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-bold text-[#93939f] uppercase tracking-wider font-mono">
                    Katalog Galeri Produk
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#212121]">
                    {activeItem.title}
                  </h2>
                  <p className="text-[#616161] text-sm md:text-base leading-relaxed mt-2 font-normal">
                    {activeItem.description}
                  </p>
                </div>

                {/* Craft details & Technical specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#f2f2f2] text-left">
                  
                  {/* Left Column: Technical Spec checklist */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
                      Technical Spec
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {activeItem.specs.paper && (
                        <li className="text-xs text-[#616161]">
                          <strong className="text-neutral-800">Paper Base:</strong> {activeItem.specs.paper}
                        </li>
                      )}
                      {activeItem.specs.weight && (
                        <li className="text-xs text-[#616161]">
                          <strong className="text-neutral-800">Card Weight:</strong> {activeItem.specs.weight}
                        </li>
                      )}
                      {activeItem.specs.techniques && (
                        <li className="text-xs text-[#616161]">
                          <strong className="text-neutral-800">Craft Methods:</strong> {activeItem.specs.techniques.join(", ")}
                        </li>
                      )}
                      {activeItem.specs.features && (
                        <li className="text-xs text-[#616161]">
                          <strong className="text-neutral-800">SaaS Modules:</strong> {activeItem.specs.features.join(", ")}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Right Column: Key Details */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
                      Artisanal Focus
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {activeItem.craftDetails.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-[#616161]">
                          <span className="text-[#346739] font-bold select-none">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-2 border-t border-[#f2f2f2] justify-between">
                  <div className="text-xs text-[#93939f] font-normal text-left w-full sm:w-auto leading-relaxed">
                    Sampaikan preferensi material Anda langsung pada tim desainer kami.
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                    <button
                      onClick={() => setActiveItem(null)}
                      className="border border-[#e5e7eb] hover:bg-neutral-50 text-neutral-700 rounded-full px-5 py-2 text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer"
                    >
                      Close Specs
                    </button>
                    
                    <Link
                      href="https://wa.me/1234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto flex items-center justify-center bg-[#212121] hover:bg-[#346739] text-white rounded-full pl-2 pr-5 py-2 gap-2 transition-colors cursor-pointer text-xs font-semibold"
                      >
                        <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                          <ArrowRightUp className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>Cetak Consultation</span>
                      </motion.button>
                    </Link>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
