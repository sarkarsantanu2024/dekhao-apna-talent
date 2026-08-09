export const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME ?? "Dekhao Apna Talent";
export const EVENT_YEAR = Number(process.env.NEXT_PUBLIC_EVENT_YEAR ?? new Date().getFullYear());
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Brand artwork. Drop the files at these exact paths:
 *   public/images/dat-icon.png  — square app icon (the star mark)
 *   public/images/dat-logo.png  — wide horizontal lockup (icon + wordmark)
 *   public/favicon.ico          — browser tab icon
 */
export const BRAND_ICON = "/images/dat-icon.png";
export const BRAND_LOGO = "/images/dat-logo.png";

/** Presented-by line — shown on the sign-in screen and dashboard sidebar. */
export const PRESENTED_BY = "Mind Mantra Abacus";

/**
 * Developer / support credit shown in the dashboard sidebar and on the sign-in
 * screen. Single source of truth — update here, it changes everywhere.
 */
export const DEVELOPER = {
  name: "Nexvora Technologies",
  website: "https://www.nexvoratechnologies.co.in/",
  facebook: "https://www.facebook.com/nexvoratechnologies",
  /** Display form. */
  phone: "9804243159",
  /** tel: link (E.164). */
  tel: "+919804243159",
  /** wa.me link — digits only, with country code. */
  whatsapp: "919804243159",
  whatsappMessage: "Hello Nexvora, I need support with the Dekhao Apna Talent admin panel.",
} as const;

export const CATEGORIES = [
  { slug: "dance",        name: "Dance",                prefix: "DANCE", fee: 400, blurb: "Any dance form — classical, folk, hip-hop, contemporary." },
  { slug: "song",         name: "Song",                 prefix: "SONG",  fee: 400, blurb: "Audition round is a cappella (no music)." },
  { slug: "mental-math",  name: "Mental Math Olympiad", prefix: "MATH",  fee: 250, blurb: "Levels L1–L8. Centre round is free." },
  { slug: "other-talent", name: "Other Talent",         prefix: "OTHER", fee: 400, blurb: "Showcase any special talent — submit a video first." },
] as const;

export const PRIZES = {
  danceSong: [
    { rank: "1st",      amount: 5000 },
    { rank: "2nd",      amount: 2500 },
    { rank: "3rd",      amount: 1500 },
    { rank: "4th–10th", amount: 1000 },
  ],
  abacus: [
    { rank: "1st",      amount: 1000 },
    { rank: "2nd",      amount: 750 },
    { rank: "3rd–5th",  amount: 500 },
  ],
} as const;

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard",  icon: "dashboard" },
  { href: "/admin/students",  label: "Students",   icon: "group" },
  { href: "/admin/centers",   label: "Centers",    icon: "storefront" },
  { href: "/admin/credentials", label: "Credentials", icon: "key" },
  { href: "/admin/payments",  label: "Payments",   icon: "payments" },
  { href: "/admin/downloads", label: "Chest Cards", icon: "badge" },
  { href: "/admin/categories",label: "Categories", icon: "category" },
  { href: "/admin/enquiries", label: "Enquiries",  icon: "mail" },
  { href: "/admin/reports",   label: "Reports",    icon: "bar_chart" },
];

export const CENTER_NAV = [
  { href: "/center/dashboard", label: "Dashboard",   icon: "dashboard" },
  { href: "/center/students",  label: "Students",    icon: "group" },
  { href: "/center/payments",  label: "Payments",    icon: "payments" },
  { href: "/center/downloads", label: "Chest Cards", icon: "badge" },
];
