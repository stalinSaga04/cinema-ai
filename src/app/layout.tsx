import type { Metadata } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: '--font-dm-sans' });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: '--font-bebas-neue' });

export const metadata: Metadata = {
  title: "Cinema AI | Director's Console",
  description: "Advanced AI Video Editing SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} ${dmSans.variable} ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  );
}
