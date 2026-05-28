import type { Metadata } from "next";
import {
  Inter,
  Outfit,
  Roboto,
  Montserrat,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["400", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Seeds - Rooted in Faith",
  description:
    "Little Seeds - A modern documentation, notes, and knowledge management platform rooted in faith, growth, and learning.",
  icons: {
    icon: "/ls-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = `${inter.variable} ${outfit.variable} ${roboto.variable} ${montserrat.variable} ${jetbrains.variable}`;

  return (
    <html
      lang="en"
      className={`h-full ${fontVariables}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
