import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import CookieConsent from "@/components/layout/CookieConsent";
import { Raleway, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import SidebarContainer from "@/components/layout/SidebarContainer";
import Backgrounds from "@/components/layout/Backgrounds";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute:
      "Grow The Pie - Growing Ethereum’s Ecosystem Together - Layer 2 User Base",
    template: "%s - Grow The Pie",
  },
  description:
    "At GrowThePie, our mission is to provide comprehensive and accurate analytics of layer 2 solutions for the Ethereum ecosystem, acting as a trusted data aggregator from reliable sources such as L2Beat and DefiLlama, while also developing our own metrics.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    title: "Grow The Pie",
    description: "Growing Ethereum’s Ecosystem Together",
    url: "https://www.growthepie.com",
    images: [
      {
        url: "/logo_full.png",
        width: 772,
        height: 181,
        alt: "Grow The Pie",
      },
      {
        url: "/logo_pie_only.png",
        width: 168,
        height: 181,
        alt: "Grow The Pie",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// If loading a variable font, you don't need to specify the font weight
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="bg-forest-50 dark:bg-[#1F2726] text-forest-900 dark:text-forest-500 font-raleway overflow-x-hidden overflow-y-auto">
        <Providers>
          <div className="flex h-fit w-full justify-center">
            <div className="flex w-full max-w-[1680px] min-h-screen">
              <SidebarContainer />
              <div className="flex flex-col flex-1 overflow-y-auto z-10 overflow-x-hidden relative min-h-full bg-white dark:bg-inherit">
                <div className="w-full relative min-h-full">
                  {/* <div
                    style={{
                      pointerEvents: "none",
                      background: `radial-gradient(75.11% 75.11% at 69.71% 24.89%, #1B2524 0%, #364240 100%) fixed`,
                    }}
                    className="absolute z-0 mouse-events-none overflow-hidden w-full h-full hidden dark:block"
                  ></div> */}
                  <Backgrounds />
                  <Header />
                  <main className="flex-1 w-full mx-auto relative z-10 mb-[165px]">
                    {children}
                  </main>
                  <div className="mt-24 w-full text-center py-6 absolute bottom-0">
                    <div className="text-[0.7rem] text-inherit dark:text-forest-400 leading-[2] ml-8 z-20">
                      © 2023 Grow The Pie 🥧
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CookieConsent />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
