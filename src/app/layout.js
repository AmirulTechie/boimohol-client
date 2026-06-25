import { Geist, Geist_Mono, Dancing_Script, Rozha_One } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dancingScript = Dancing_Script({ weight: ["700"], subsets: ["latin"], variable: "--font-dance", display: "swap" });
const rozhaOne = Rozha_One({ weight: ["400"], subsets: ["latin"], variable: "--font-logo", display: "swap" });

export const metadata = { title: "Boimohol", description: "Book delivery management" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${rozhaOne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fdf8f1] suppressHydrationWarning">
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}