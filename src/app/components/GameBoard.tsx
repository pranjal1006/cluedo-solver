"use client";

import { useState } from "react";
import { useGameContext } from "../models/GameContext";
import { CardType, Suspect, Weapon, Room, CardStatus } from "../types/gameTypes";
import { createSuspectCard, createWeaponCard, createRoomCard } from "../utils/cardTypeGuards";

export default function GameBoard() {
  const { gameState, probabilities, makeSuggestion } = useGameContext();
  const [showProbabilityCard, setShowProbabilityCard] = useState(false);
  
  // Suggestion form state
  const [suggestionForm, setSuggestionForm] = useState({
    playerId: 0,
    suspect: Object.values(Suspect)[0],
    weapon: Object.values(Weapon)[0],
    room: Object.values(Room)[0],
    responderId: null as number | null
  });
  
  if (!gameState) return null;
  
  // Helper function to get probability percentage
  const getProbabilityPercentage = (probability: number): string => {
    return `${Math.round(probability * 100)}%`;
  };
  
  // Gets status class for displaying cards
  const getStatusClass = (playerId: number, cardType: CardType, cardName: string): string => {
    const player = gameState.players[playerId];
    if (!player) return "bg-gray-700 text-gray-300"; // Unknown
    
    let card;
    if (cardType === CardType.SUSPECT) {
      card = createSuspectCard(cardName as Suspect);
    } else if (cardType === CardType.WEAPON) {
      card = createWeaponCard(cardName as Weapon);
    } else {
      card = createRoomCard(cardName as Room);
    }
    
    const key = `${card.type}:${card.name}`;
    const status = player.cardStatuses.get(key);
    
    switch (status) {
      case CardStatus.HAS:
        return "bg-green-700 text-white"; // Has card
      case CardStatus.DOES_NOT_HAVE:
        return "bg-red-700 text-white"; // Doesn't have card
      case CardStatus.MAYBE_HAS:
        return "bg-yellow-600 text-white"; // Maybe has card
      default:
        return "bg-gray-700 text-gray-300"; // Unknown
    }
  };
  
  // Get solution probability class
  const getSolutionProbabilityClass = (probability: number): string => {
    if (probability >= 0.9) return "bg-green-700 text-white";
    if (probability >= 0.5) return "bg-green-600 text-white";
    if (probability >= 0.3) return "bg-yellow-600 text-white";
    if (probability > 0) return "bg-yellow-700 text-white";
    return "bg-red-700 text-white";
  };
  
  // Handle suggestion form change
  const handleSuggestionChange = (field: string, value: string | number | null) => {
    if (field === 'playerId') {
      // Convert player ID to number
      setSuggestionForm(prev => ({ ...prev, [field]: Number(value) }));
    } else if (field === 'responderId') {
      // Convert responder ID to number or null
      setSuggestionForm(prev => ({ 
        ...prev, 
        [field]: value === "" ? null : Number(value) 
      }));
    } else {
      // Handle other fields normally
      setSuggestionForm(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Submit suggestion
  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    makeSuggestion({
      playerId: Number(suggestionForm.playerId),
      suspect: suggestionForm.suspect,
      weapon: suggestionForm.weapon,
      room: suggestionForm.room,
      responderId: suggestionForm.responderId
    });
    
    // Reset form
    setSuggestionForm(prev => ({
      ...prev,
      playerId: 0,
      responderId: null
    }));
  };
  
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Cluedo Solver</h1>
      
      {/* Players Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.players.map(player => (
            <div 
              key={player.id} 
              className={`border rounded-lg p-4 ${player.isUser ? 'border-red-500 bg-slate-800' : 'border-gray-600 bg-gray-800'}`}
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-lg">{player.name}</h3>
                {player.isUser && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">You</span>}
              </div>
              <p>Cards: {player.cardCount}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Solution */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Solution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h3 className="font-medium mb-2">Suspect</h3>
            <p className="text-lg">
              {gameState.solution.suspect || "Unknown"}
            </p>
          </div>
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h3 className="font-medium mb-2">Weapon</h3>
            <p className="text-lg">
              {gameState.solution.weapon || "Unknown"}
            </p>
          </div>
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h3 className="font-medium mb-2">Room</h3>
            <p className="text-lg">
              {gameState.solution.room || "Unknown"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Toggle Probability Table */}
      <div className="mb-8">
        <button 
          onClick={() => setShowProbabilityCard(!showProbabilityCard)} 
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          {showProbabilityCard ? "Hide" : "Show"} Probability Card
        </button>
      </div>
      
      {/* Probability Table */}
      {showProbabilityCard && (
        <div className="mb-8 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">Probability Card</h2>
          <table className="min-w-full bg-gray-800 border border-gray-600">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-3 border-b border-gray-600 text-left">Card</th>
                <th className="py-2 px-3 border-b border-gray-600 text-center">Solution</th>
                {gameState.players.map(player => (
                  <th key={player.id} className="py-2 px-3 border-b border-gray-600 text-center">
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Suspects */}
              <tr>
                <td colSpan={gameState.players.length + 2} className="py-1 px-3 bg-red-800 text-white font-medium">
                  Suspects
                </td>
              </tr>
              {Object.values(Suspect).map(suspect => {
                const prob = probabilities.find(p => 
                  p.card.type === CardType.SUSPECT && p.card.name === suspect
                );
                
                return (
                  <tr key={suspect} className="border-b border-gray-600">
                    <td className="py-1 px-3">{suspect}</td>
                    <td className={`py-1 px-3 text-center ${prob ? getSolutionProbabilityClass(prob.inSolution) : ''}`}>
                      {prob ? getProbabilityPercentage(prob.inSolution) : '0%'}
                    </td>
                    {gameState.players.map(player => (
                      <td 
                        key={player.id} 
                        className={`py-1 px-3 text-center ${getStatusClass(player.id, CardType.SUSPECT, suspect)}`}
                      >
                        {prob && prob.playerProbabilities.get(player.id) 
                          ? getProbabilityPercentage(prob.playerProbabilities.get(player.id)!) 
                          : '0%'
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
              
              {/* Weapons */}
              <tr>
                <td colSpan={gameState.players.length + 2} className="py-1 px-3 bg-red-800 text-white font-medium">
                  Weapons
                </td>
              </tr>
              {Object.values(Weapon).map(weapon => {
                const prob = probabilities.find(p => 
                  p.card.type === CardType.WEAPON && p.card.name === weapon
                );
                
                return (
                  <tr key={weapon} className="border-b border-gray-600">
                    <td className="py-1 px-3">{weapon}</td>
                    <td className={`py-1 px-3 text-center ${prob ? getSolutionProbabilityClass(prob.inSolution) : ''}`}>
                      {prob ? getProbabilityPercentage(prob.inSolution) : '0%'}
                    </td>
                    {gameState.players.map(player => (
                      <td 
                        key={player.id}
                        className={`py-1 px-3 text-center ${getStatusClass(player.id, CardType.WEAPON, weapon)}`}
                      >
                        {prob && prob.playerProbabilities.get(player.id)
                          ? getProbabilityPercentage(prob.playerProbabilities.get(player.id)!)
                          : '0%'
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
              
              {/* Rooms */}
              <tr>
                <td colSpan={gameState.players.length + 2} className="py-1 px-3 bg-red-800 text-white font-medium">
                  Rooms
                </td>
              </tr>
              {Object.values(Room).map(room => {
                const prob = probabilities.find(p => 
                  p.card.type === CardType.ROOM && p.card.name === room
                );
                
                return (
                  <tr key={room} className="border-b border-gray-600">
                    <td className="py-1 px-3">{room}</td>
                    <td className={`py-1 px-3 text-center ${prob ? getSolutionProbabilityClass(prob.inSolution) : ''}`}>
                      {prob ? getProbabilityPercentage(prob.inSolution) : '0%'}
                    </td>
                    {gameState.players.map(player => (
                      <td 
                        key={player.id}
                        className={`py-1 px-3 text-center ${getStatusClass(player.id, CardType.ROOM, room)}`}
                      >
                        {prob && prob.playerProbabilities.get(player.id)
                          ? getProbabilityPercentage(prob.playerProbabilities.get(player.id)!)
                          : '0%'
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Record Suggestion Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Record Suggestion</h2>
        <form onSubmit={handleSuggestionSubmit} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Player making suggestion */}
            <div>
              <label className="block mb-1">Player making suggestion</label>
              <select 
                value={suggestionForm.playerId}
                onChange={(e) => handleSuggestionChange('playerId', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
              >
                {gameState.players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            {/* Player who responded */}
            <div>
              <label className="block mb-1">Player who responded (if any)</label>
              <select 
                value={suggestionForm.responderId === null ? "" : suggestionForm.responderId}
                onChange={(e) => handleSuggestionChange('responderId', e.target.value === "" ? null : e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
              >
                <option value="">No one responded</option>
                {gameState.players.filter(p => p.id !== suggestionForm.playerId).map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Suggestion Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-1">Suspect</label>
              <select 
                value={suggestionForm.suspect}
                onChange={(e) => handleSuggestionChange('suspect', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
              >
                {Object.values(Suspect).map(suspect => (
                  <option key={suspect} value={suspect}>{suspect}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Weapon</label>
              <select 
                value={suggestionForm.weapon}
                onChange={(e) => handleSuggestionChange('weapon', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
              >
                {Object.values(Weapon).map(weapon => (
                  <option key={weapon} value={weapon}>{weapon}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Room</label>
              <select 
                value={suggestionForm.room}
                onChange={(e) => handleSuggestionChange('room', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
              >
                {Object.values(Room).map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Record Suggestion
          </button>
        </form>
      </div>
      
      {/* Suggestion History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Suggestion History</h2>
        {gameState.suggestions.length === 0 ? (
          <p className="text-gray-400">No suggestions have been made yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-600 bg-gray-800">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-3 border-b border-gray-600">Player</th>
                  <th className="py-2 px-3 border-b border-gray-600">Suspect</th>
                  <th className="py-2 px-3 border-b border-gray-600">Weapon</th>
                  <th className="py-2 px-3 border-b border-gray-600">Room</th>
                  <th className="py-2 px-3 border-b border-gray-600">Responder</th>
                  <th className="py-2 px-3 border-b border-gray-600">Card Shown</th>
                </tr>
              </thead>
              <tbody>
                {gameState.suggestions.map((suggestion, index) => (
                  <tr key={index} className="border-b border-gray-600">
                    <td className="py-2 px-3">{gameState.players[suggestion.playerId]?.name || `Player ${suggestion.playerId}`}</td>
                    <td className="py-2 px-3">{suggestion.suspect}</td>
                    <td className="py-2 px-3">{suggestion.weapon}</td>
                    <td className="py-2 px-3">{suggestion.room}</td>
                    <td className="py-2 px-3">
                      {suggestion.responderId !== null 
                        ? gameState.players[suggestion.responderId]?.name || `Player ${suggestion.responderId}`
                        : "No one"}
                    </td>
                    <td className="py-2 px-3">
                      {suggestion.cardShown 
                        ? `${suggestion.cardShown.name} (${suggestion.cardShown.type})`
                        : suggestion.responderId !== null 
                          ? "Unknown" 
                          : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
