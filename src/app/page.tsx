"use client";

import { useGameContext } from "./models/GameContext";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import RecentGames from "./components/RecentGames";
import { useState } from "react";

export default function Home() {
  const { isSetup, isLoading } = useGameContext();
  const [showNewGame, setShowNewGame] = useState<boolean>(true);

  // If game is in setup, show either new game form or recent games
  if (!isSetup) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
              Cluedo Solver
            </h1>
            <p className="text-xl text-gray-300">
              Track information and solve mysteries more effectively
            </p>
          </header>

          <div className="flex justify-center mb-10">
            <div className="bg-gray-800 inline-flex rounded-lg p-1" role="group">
              <button
                type="button"
                onClick={() => setShowNewGame(true)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  showNewGame ? 'bg-red-600 text-white shadow-lg' : 'text-gray-300'
                }`}
              >
                New Game
              </button>
              <button
                type="button"
                onClick={() => setShowNewGame(false)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  !showNewGame ? 'bg-red-600 text-white shadow-lg' : 'text-gray-300'
                }`}
              >
                Load Game
              </button>
            </div>
          </div>

          <div className="mt-8">
            {showNewGame ? <GameSetup /> : <RecentGames />}
          </div>
        </div>
      </div>
    );
  }

  // Show loading indicator if operations are in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-600"></div>
          <p className="mt-4 text-xl text-gray-300">Processing your game...</p>
        </div>
      </div>
    );
  }

  // If game is set up and not loading, show the game board
  return (
    <div className="min-h-screen bg-slate-900">
      <GameBoard />
    </div>
  );
}
