import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://abhishek.dev"),
  title: "Abhishek | Full Stack Developer",
  description:
    "Portfolio of Abhishek — Full Stack Developer passionate about building scalable web applications and solving real-world problems through clean code.",
  keywords: [
    "Abhishek",
    "Full Stack Developer",
    "Software Developer",
    "React",
    "Next.js",
    "Web Development",
    "Portfolio",
  ],
  openGraph: {
    title: "Abhishek | Full Stack Developer",
    description:
      "Full Stack Developer passionate about building scalable web applications and solving real-world problems.",
    url: "https://abhishek.dev",
    siteName: "Abhishek Portfolio",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abhishek | Full Stack Developer",
    description:
      "Full Stack Developer passionate about building scalable web applications.",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-[#0a0a0a] text-white min-h-screen">
        <ClientProviders>
          <CustomCursor />
          <Navbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
