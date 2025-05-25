"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-4">Cluedo Solver - Test Page</h1>
        <p className="mb-4">This is a simple test page to verify that client-side rendering is working correctly.</p>
        
        <div className="flex items-center justify-center my-8 gap-4">
          <button 
            onClick={() => setCount(count - 1)}
            className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
          >
            -
          </button>
          <span className="text-2xl font-bold">{count}</span>
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
          >
            +
          </button>
        </div>
        
        <Link 
          href="/"
          className="block text-center mt-6 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
