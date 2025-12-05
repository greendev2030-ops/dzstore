import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import { Outfit, Orbitron } from "next/font/google";
import { Providers } from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"] });
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: '--font-orbitron',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={orbitron.variable}>
      <body className={`${outfit.className} bg-black text-slate-200 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white antialiased dark:bg-black dark:text-slate-200 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:text-slate-900`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
