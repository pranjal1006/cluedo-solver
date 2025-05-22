"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { GameContextProvider } from "./models/GameContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameContextProvider>
          {children}
        </GameContextProvider>
      </body>
    </html>
  );
}
