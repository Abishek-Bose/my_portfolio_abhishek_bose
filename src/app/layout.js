import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import ClientProviders from "@/components/ClientProviders";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
      // globals.css sets `scroll-behavior: smooth` for in-page anchors. Next 16
      // no longer overrides that on route changes, so navigations would
      // smooth-scroll to the top instead of jumping. This opts back into
      // instant-scroll-on-navigation without losing smooth in-page anchors.
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="bg-ink text-white min-h-screen">
        <ClientProviders>
          <CustomCursor />
          <Navbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
