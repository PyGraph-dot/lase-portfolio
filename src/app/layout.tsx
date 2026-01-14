import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/chat/ChatWidget";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CustomCursor from "@/components/ui/CustomCursor";

// 1. THE SEO CONFIGURATION
export const metadata: Metadata = {
  metadataBase: new URL('https://lase.vercel.app'), // REPLACE with your actual Vercel domain later
  title: {
    default: "LASE | Digital Architect & Brand Identity Expert",
    template: "%s | LASE"
  },
  description: "Portfolio of Toluwalase Samuel Adedeji. Expert Graphic Designer, Web Developer, and SEO Specialist based in Lagos, Nigeria. Specializing in high-performance Next.js websites and luxury brand identities.",
  keywords: ["Graphic Designer Lagos", "Web Developer Nigeria", "Brand Identity Specialist", "Next.js Developer", "SEO Expert Ikorodu", "Luxury Branding"],
  authors: [{ name: "Toluwalase Samuel Adedeji" }],
  creator: "Toluwalase Samuel Adedeji",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://lase.vercel.app",
    title: "LASE | Digital Architect",
    description: "Building digital empires. Precision Brand Identity & High-Performance Web Development.",
    siteName: "LASE Portfolio",
    images: [
      {
        url: "/og-image.jpg.png", // We will create this file next
        width: 1200,
        height: 630,
        alt: "LASE Digital Architect Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LASE | Digital Architect",
    description: "Building digital empires. Precision Brand Identity & Web Development.",
    images: [{
        url: "/og-image.jpg.png",
        width: 1200,
        height: 630,
        alt: "LASE Digital Architect Portfolio",
    }], // Same image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#050505] text-white md:cursor-none cursor-auto">
        <CustomCursor />
        <Header />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}