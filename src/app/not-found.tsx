"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-4xl mb-4 bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">Page Not Found</h2>
        <p className="mb-8 text-gray-300">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
