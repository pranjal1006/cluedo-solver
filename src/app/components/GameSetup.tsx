"use client";

import { useState } from "react";
import { Card, CardType, Room, Suspect, Weapon } from "../types/gameTypes";
import { useGameContext } from "../models/GameContext";
import { createRoomCard, createSuspectCard, createWeaponCard } from "../utils/cardTypeGuards";

export default function GameSetup() {
  const { initGame } = useGameContext();
  const [numPlayers, setNumPlayers] = useState<number>(3);
  const [playerNames, setPlayerNames] = useState<string[]>(['Me', 'Player 2', 'Player 3']);
  const [userPosition, setUserPosition] = useState<number>(0);
  
  // Selected cards for the user
  const [selectedSuspects, setSelectedSuspects] = useState<Suspect[]>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<Weapon[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  
  // Handle changing the number of players
  const handleNumPlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNumPlayers = parseInt(e.target.value, 10);
    setNumPlayers(newNumPlayers);
    
    // Adjust the player names array
    if (newNumPlayers > playerNames.length) {
      // Add more players
      const newNames = [...playerNames];
      for (let i = playerNames.length; i < newNumPlayers; i++) {
        newNames.push(`Player ${i + 1}`);
      }
      setPlayerNames(newNames);
    } else if (newNumPlayers < playerNames.length) {
      // Remove excess players
      setPlayerNames(playerNames.slice(0, newNumPlayers));
      
      // Adjust user position if needed
      if (userPosition >= newNumPlayers) {
        setUserPosition(newNumPlayers - 1);
      }
    }
  };
  
  // Handle changing player names
  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };
  
  // Handle selecting a card
  const handleSuspectToggle = (suspect: Suspect) => {
    setSelectedSuspects(prev => 
      prev.includes(suspect) 
      ? prev.filter(s => s !== suspect) 
      : [...prev, suspect]
    );
  };
  
  const handleWeaponToggle = (weapon: Weapon) => {
    setSelectedWeapons(prev => 
      prev.includes(weapon) 
      ? prev.filter(w => w !== weapon) 
      : [...prev, weapon]
    );
  };
  
  const handleRoomToggle = (room: Room) => {
    setSelectedRooms(prev => 
      prev.includes(room) 
      ? prev.filter(r => r !== room) 
      : [...prev, room]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert selected cards to Card objects
    const userCards: Card[] = [
      ...selectedSuspects.map(suspect => createSuspectCard(suspect)),
      ...selectedWeapons.map(weapon => createWeaponCard(weapon)),
      ...selectedRooms.map(room => createRoomCard(room))
    ];
    
    // Initialize the game
    initGame(playerNames, userPosition, userCards);
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Game Setup</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Number of Players</label>
          <select
            value={numPlayers}
            onChange={handleNumPlayersChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {[3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Player Names</label>
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={e => handlePlayerNameChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  placeholder={`Player ${index + 1}`}
                />
                <label className="ml-4">
                  <input
                    type="radio"
                    name="userPosition"
                    checked={userPosition === index}
                    onChange={() => setUserPosition(index)}
                    className="mr-2"
                  />
                  This is me
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Cards</h3>
          <p className="text-sm text-gray-600 mb-4">Select the cards you have in your hand.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Suspects</h4>
              <div className="space-y-2">
                {Object.values(Suspect).map(suspect => (
                  <label key={suspect} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSuspects.includes(suspect)}
                      onChange={() => handleSuspectToggle(suspect)}
                      className="mr-2"
                    />
                    {suspect}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Weapons</h4>
              <div className="space-y-2">
                {Object.values(Weapon).map(weapon => (
                  <label key={weapon} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedWeapons.includes(weapon)}
                      onChange={() => handleWeaponToggle(weapon)}
                      className="mr-2"
                    />
                    {weapon}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Rooms</h4>
              <div className="space-y-2">
                {Object.values(Room).map(room => (
                  <label key={room} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRooms.includes(room)}
                      onChange={() => handleRoomToggle(room)}
                      className="mr-2"
                    />
                    {room}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
}
