"use client";

import { useGameContext } from "./models/GameContext";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";

export default function Home() {
  const { isSetup } = useGameContext();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {isSetup ? (
        <GameBoard />
      ) : (
        <GameSetup />
      )}
    </main>
  );
}
