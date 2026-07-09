// Landing-page navigation shared by Navbar, CurvedMenu and HeroMorph so the
// three menus can never drift apart. Keys resolve in the "Navbar" i18n
// namespace; hrefs anchor to landing sections.
export const NAV_ITEMS = [
  { key: "templates", href: "/#templates" },
  { key: "services", href: "/#services" },
  { key: "pricing", href: "/#pricing" },
  { key: "faq", href: "/#faq" },
] as const;

export type NavItemKey = (typeof NAV_ITEMS)[number]["key"];
