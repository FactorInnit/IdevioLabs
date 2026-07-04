import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { ThemeScript } from "@/components/ThemeScript";
import { COMPANY_NAME, PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PRODUCT_NAME} — Plan & launch your startup with AI`,
  description: PRODUCT_DESCRIPTION,
  applicationName: PRODUCT_NAME,
  authors: [{ name: COMPANY_NAME, url: SITE_URL }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: PRODUCT_NAME,
    title: `${PRODUCT_NAME} — Plan & launch your startup with AI`,
    description: PRODUCT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT_NAME} — Plan & launch your startup with AI`,
    description: PRODUCT_DESCRIPTION,
  },
  icons: {
    icon: "/images/idevio-logo.png",
    apple: "/images/idevio-logo.png",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${instrumentSerif.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <CookieNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
