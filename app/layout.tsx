import type { Metadata } from "next";
import { Comfortaa, Noto_Kufi_Arabic } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
  weight: ["300", "400", "500", "600", "700"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    template: "%s · Crumbleivable!",
    default: "Crumbleivable! — Chewy American Cookies in Wahran",
  },
  description:
    "Chewy, gooey American-style cookies delivered to your door in Wahran (Oran), Algeria. Order online, no account needed.",
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: "Crumbleivable!",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${comfortaa.variable} ${notoKufiArabic.variable}`}
    >
      <body className="font-body bg-[#FDF6EE] text-[#2C1810] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
