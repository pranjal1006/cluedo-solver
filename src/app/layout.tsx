"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { GameContextProvider } from "./models/GameContext";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Add hydration check to prevent hydration mismatch errors
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900`}>
        <GameContextProvider>
          {isMounted ? children : 
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
                  Cluedo Solver
                </h1>
                <div className="mt-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-red-600"></div>
                </div>
              </div>
            </div>
          }
        </GameContextProvider>
      </body>
    </html>
  );
}
