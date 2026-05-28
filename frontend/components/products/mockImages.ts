// Mock product imagery sourced from Pexels (royalty-free).
// Replace these with real product photography once available.
//
// Source: https://www.pexels.com/

export interface MockProductImage {
  id: string;
  src: string;
  alt: string;
  /** Used for the rotated/scaled "different angle" effect in the gallery. */
  rotate: number;
  scale: number;
}

export const MOCK_PRODUCT_IMAGES: MockProductImage[] = [
  {
    id: "front",
    src: "https://images.pexels.com/photos/931796/pexels-photo-931796.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Floral wedding invitation laid flat with greenery accents",
    rotate: 0,
    scale: 1,
  },
  {
    id: "angle-left",
    src: "https://images.pexels.com/photos/1779415/pexels-photo-1779415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Wedding stationery suite with rings and dried flowers",
    rotate: -2,
    scale: 0.96,
  },
  {
    id: "angle-right",
    src: "https://images.pexels.com/photos/265923/pexels-photo-265923.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Elegant wedding invitation card on linen background",
    rotate: 2,
    scale: 0.96,
  },
];
