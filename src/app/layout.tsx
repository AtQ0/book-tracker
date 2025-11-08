import type { Metadata } from "next";
import { Merriweather, Merriweather_Sans } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-merriweather", // Expose to global css file
});

const merriweatherSans = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-merriweather-sans", // Expose to global css file
});

export const metadata: Metadata = {
  title: "book-tracker",
  description: "Track, rate, and discover books.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${merriweatherSans.variable}`}
    >
      <body className="min-h-dvh bg-baby-powder text-kobicha flex flex-col antialiased selection:bg-peach-yellow/40 selection:text-black-bean">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
