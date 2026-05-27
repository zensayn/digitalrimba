// src/data/invitation.ts
// ─── Wedding data for Pangky & Radit ────────────────────────

export const couple = {
  groom: {
    name: "Pangky",
    fullName: "Pangky Pratama Putra",
    parents: "Putra Bapak H. Ahmad & Ibu Siti Rahmawati",
    photo: "/images/groom.jpg",
    instagram: "@pangky.pratama",
  },
  bride: {
    name: "Radit",
    fullName: "Radit Kusuma Wardana",
    parents: "Putra Bapak Drs. Budi Santoso & Ibu Dewi Kusumawati",
    photo: "/images/bride.jpg",
    instagram: "@radit.kusuma",
  },
  hashtag: "#PangkyRaditForever",
  quote: "Dua jiwa, satu akar. Bersama kita tumbuh.",
};

export const events = {
  akad: {
    title: "Akad Nikah",
    day: "Sabtu",
    date: "14 Juni 2026",
    time: "08.00 – 10.00 WIB",
    venue: "Masjid Agung Al-Falah",
    address: "Jl. Merdeka No. 1, Jakarta Selatan",
    mapsUrl: "https://maps.google.com/?q=-6.2088,106.8456",
    embedUrl: "https://maps.google.com/maps?q=-6.2088,106.8456&z=16&output=embed",
    // WIB = UTC+7: 08:00 → 01:00Z, 10:00 → 03:00Z
    startISO: "20260614T010000Z",
    endISO: "20260614T030000Z",
  },
  resepsi: {
    title: "Resepsi",
    day: "Sabtu",
    date: "14 Juni 2026",
    time: "11.00 – 15.00 WIB",
    venue: "The Rimba Garden Hall",
    address: "Jl. Sudirman Kav. 22, Jakarta Pusat",
    mapsUrl: "https://maps.google.com/?q=-6.2092,106.8229",
    embedUrl: "https://maps.google.com/maps?q=-6.2092,106.8229&z=16&output=embed",
    // WIB = UTC+7: 11:00 → 04:00Z, 15:00 → 08:00Z
    startISO: "20260614T040000Z",
    endISO: "20260614T080000Z",
  },
};

export const weddingDate = new Date("2026-06-14T08:00:00");

export const gallery = [
  { src: "https://picsum.photos/seed/rimba1/600/600?grayscale", alt: "Momen bersama" },
  { src: "https://picsum.photos/seed/rimba2/600/600?grayscale", alt: "Senyum bahagia" },
  { src: "https://picsum.photos/seed/rimba3/600/600?grayscale", alt: "Kasih sayang" },
  { src: "https://picsum.photos/seed/rimba4/600/600?grayscale", alt: "Perjalanan cinta" },
  { src: "https://picsum.photos/seed/rimba5/600/600?grayscale", alt: "Kenangan indah" },
];

export const bankAccounts = [
  { bank: "BCA", name: "Pangky Pratama Putra", number: "1234 5678 9012" },
  { bank: "Mandiri", name: "Radit Kusuma Wardana", number: "9876 5432 1098" },
];

export const loveStory = [
  {
    chapter: "Awal Bertemu",
    year: "2020",
    description:
      "Pertemuan tak terduga di sebuah sore yang tenang. Sebuah tatapan, sebuah senyum — dan dunia terasa berbeda.",
    image: "https://picsum.photos/seed/story1/400/400?grayscale",
  },
  {
    chapter: "Jatuh Cinta",
    year: "2021",
    description:
      "Perasaan itu tumbuh perlahan, seperti akar yang menghujam dalam. Tanpa disadari, hidupku sudah tak sama.",
    image: "https://picsum.photos/seed/story2/400/400?grayscale",
  },
  {
    chapter: "Bersama",
    year: "2022",
    description:
      "Setiap momen kecil menjadi kenangan besar. Tawa, air mata, dan segala hal di antaranya — kita lalui bersama.",
    image: "https://picsum.photos/seed/story3/400/400?grayscale",
  },
  {
    chapter: "Lamaran",
    year: "2025",
    description:
      "Di bawah langit senja yang jingga, dengan gentar aku bertanya — dan ia menjawab iya.",
    image: "https://picsum.photos/seed/story4/400/400?grayscale",
  },
];

export const dressCode = {
  theme: "Elegant Neutral",
  description:
    "Kami mengundang Anda untuk tampil elegan bersama kami. Kenakan busana dengan warna-warna lembut dan netral yang mencerminkan keanggunan hari istimewa ini.",
  colors: [
    { hex: "#F0EDE6", name: "Ivory" },
    { hex: "#C9A84C", name: "Champagne" },
    { hex: "#C4A090", name: "Dusty Rose" },
    { hex: "#8A9E85", name: "Sage" },
    { hex: "#A89278", name: "Taupe" },
    { hex: "#1E2E42", name: "Midnight" },
  ],
  avoid: ["Putih murni", "Merah cerah"],
};
