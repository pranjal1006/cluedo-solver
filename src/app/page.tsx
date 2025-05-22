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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Cluedo Solver</h1>
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setShowNewGame(true)}
                className={`px-4 py-2 text-sm font-medium border ${
                  showNewGame
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                } rounded-l-lg`}
              >
                New Game
              </button>
              <button
                type="button"
                onClick={() => setShowNewGame(false)}
                className={`px-4 py-2 text-sm font-medium border ${
                  !showNewGame
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                } rounded-r-lg`}
              >
                Load Game
              </button>
            </div>
          </div>
          
          {showNewGame ? <GameSetup /> : <RecentGames />}
        </div>
      </main>
    );
  }

  // Show loading indicator if operations are in progress
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // If game is set up and not loading, show the game board
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <GameBoard />
    </main>
  );
}
