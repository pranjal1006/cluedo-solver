"use client";

import { useState, useEffect } from 'react';
import { useGameContext } from '../models/GameContext';

type GameSummary = {
  id: string;
  createdAt: Date;
  name?: string;
};

export default function RecentGames() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { loadGame } = useGameContext();

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/games');
        if (response.ok) {
          const data = await response.json();
          // Convert string dates to Date objects
          const gamesWithDates = data.map((game: {id: string, createdAt: string, name?: string}) => ({
            ...game,
            createdAt: new Date(game.createdAt)
          }));
          setGames(gamesWithDates);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleLoadGame = (id: string) => {
    loadGame(id);
  };

  // Format the date to be more readable
  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center p-4 text-gray-300">Loading recent games...</div>;
  }

  if (games.length === 0) {
    return <div className="text-center p-4 italic text-gray-400">No saved games found.</div>;
  }

  return (
    <div className="mt-8 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Recent Games</h2>
      <div className="overflow-hidden border border-gray-700 rounded-md bg-gray-800">
        <ul className="divide-y divide-gray-700">
          {games.map((game) => (
            <li key={game.id} className="p-4 hover:bg-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">{game.name || `Game ${game.id.substring(0, 8)}`}</h3>
                  <p className="text-sm text-gray-400">{formatDate(game.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleLoadGame(game.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Load
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
