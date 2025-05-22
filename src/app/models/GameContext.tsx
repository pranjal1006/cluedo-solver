"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Card, CardProbability, CardStatus, GameState, Player, Room, Suspect, Suggestion, Weapon } from "../types/gameTypes";
import { 
  initializeGame, 
  addSuggestion, 
  calculateProbabilities,
  setCardStatus,
  getCardKey
} from "../utils/gameLogic";
import { createRoomCard, createSuspectCard, createWeaponCard } from "../utils/cardTypeGuards";

interface GameContextType {
  gameState: GameState | null;
  probabilities: CardProbability[];
  initGame: (playerNames: string[], userPosition: number, userCards: Card[], cardsPerPlayer?: number[]) => void;
  makeSuggestion: (suggestion: Omit<Suggestion, "cardShown">) => void;
  revealCard: (suggestion: Suggestion, card: Card) => void;
  updateCardStatus: (playerId: number, card: Card, status: CardStatus) => void;
  isSetup: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameContextProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [probabilities, setProbabilities] = useState<CardProbability[]>([]);
  const [isSetup, setIsSetup] = useState<boolean>(false);

  // When the game state changes, recalculate probabilities
  useEffect(() => {
    if (gameState) {
      const newProbabilities = calculateProbabilities(gameState);
      setProbabilities(newProbabilities);
    }
  }, [gameState]);

  // Initialize the game
  const initGame = (playerNames: string[], userPosition: number, userCards: Card[], cardsPerPlayer?: number[]) => {
    const newGameState = initializeGame(playerNames, userPosition, userCards, cardsPerPlayer);
    setGameState(newGameState);
    setIsSetup(true);
  };

  // Record a suggestion made by a player
  const makeSuggestion = (suggestionData: Omit<Suggestion, "cardShown">) => {
    if (!gameState) return;
    
    const suggestion: Suggestion = { 
      ...suggestionData,
      cardShown: undefined
    };
    
    const newGameState = addSuggestion(gameState, suggestion);
    setGameState(newGameState);
  };

  // Record a revealed card from a suggestion
  const revealCard = (suggestion: Suggestion, card: Card) => {
    if (!gameState) return;
    
    // Create a new suggestion with the revealed card
    const newSuggestion: Suggestion = {
      ...suggestion,
      cardShown: card
    };
    
    const newGameState = addSuggestion(gameState, newSuggestion);
    setGameState(newGameState);
  };

  // Update the status of a card for a player
  const updateCardStatus = (playerId: number, card: Card, status: CardStatus) => {
    if (!gameState) return;
    
    const newGameState = setCardStatus(gameState, playerId, card, status);
    setGameState(newGameState);
  };

  const value = {
    gameState,
    probabilities,
    initGame,
    makeSuggestion,
    revealCard,
    updateCardStatus,
    isSetup
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
};
