import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { EVENT_NAME, SITE_URL } from "@/constants";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${EVENT_NAME} 2026 — Eastern India's Biggest Talent Contest`, template: `%s · ${EVENT_NAME}` },
  description: "Talent competition & Mental Math Olympiad for students aged 6–14, presented by Mind Mantra Abacus.",
  keywords: ["talent contest", "mental math olympiad", "abacus", "dance", "song", "Kolkata", "Mind Mantra"],
  openGraph: {
    type: "website",
    title: `${EVENT_NAME} 2026`,
    description: "Eastern India's biggest talent contest — Dance, Song, Mental Math Olympiad & more.",
    siteName: EVENT_NAME,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Fraunces — warm editorial display serif (optical + soft axes for
            personality); Plus Jakarta Sans — clean humanist UI/body. Material
            Symbols + Poppins kept for the dashboards (.theme-grey). */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500;1,9..144,600;1,9..144,700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500;1,600&family=Poppins:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
