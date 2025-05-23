"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Card, CardProbability, CardStatus, GameState, Player, Room, Suspect, Suggestion, Weapon } from "../types/gameTypes";
import { 
  initializeGame, 
  addSuggestion as addSuggestionToState, 
  calculateProbabilities,
  setCardStatus as setCardStatusInState,
  getCardKey
} from "../utils/gameLogic";
import { createRoomCard, createSuspectCard, createWeaponCard } from "../utils/cardTypeGuards";

interface GameContextType {
  gameState: GameState | null;
  gameId: string | null;
  probabilities: CardProbability[];
  isSetup: boolean;
  isLoading: boolean;
  initGame: (playerNames: string[], userPosition: number, userCards: Card[], cardsPerPlayer?: number[]) => Promise<void>;
  makeSuggestion: (suggestion: Omit<Suggestion, "cardShown">) => Promise<void>;
  revealCard: (suggestion: Suggestion, card: Card) => Promise<void>;
  updateCardStatus: (playerId: number, card: Card, status: CardStatus) => Promise<void>;
  loadGame: (id: string) => Promise<void>;
  getRecentGames: () => Promise<{id: string, createdAt: Date, name?: string}[]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameContextProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [probabilities, setProbabilities] = useState<CardProbability[]>([]);
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // When the game state changes, recalculate probabilities
  useEffect(() => {
    if (gameState) {
      try {
        // Make sure card statuses are properly set up as Maps
        const validatedState = {
          ...gameState,
          players: gameState.players.map(player => {
            // Ensure cardStatuses is a Map
            if (!(player.cardStatuses instanceof Map)) {
              const mapCardStatuses = new Map<string, CardStatus>();
              
              // If it's an object, convert it to a Map
              if (typeof player.cardStatuses === 'object' && player.cardStatuses !== null) {
                Object.entries(player.cardStatuses).forEach(([key, value]) => {
                  mapCardStatuses.set(key, value as CardStatus);
                });
              }
              
              return {
                ...player,
                cardStatuses: mapCardStatuses
              };
            }
            
            return player;
          })
        };
        
        const newProbabilities = calculateProbabilities(validatedState);
        setProbabilities(newProbabilities);
      } catch (error) {
        console.error("Error calculating probabilities:", error);
      }
    }
  }, [gameState]);

  // Initialize the game
  const initGame = async (playerNames: string[], userPosition: number, userCards: Card[], cardsPerPlayer?: number[]) => {
    setIsLoading(true);
    try {
      // First create game in memory
      const newGameState = initializeGame(playerNames, userPosition, userCards, cardsPerPlayer);
      setGameState(newGameState);
      setIsSetup(true);
      
      // Then save to database
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerNames,
          userPosition,
          userCards,
          cardsPerPlayer
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save game: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGameId(data.gameId);
    } catch (error) {
      console.error("Error initializing game:", error);
      // Game is already set up in memory, so we continue even if DB save fails
    } finally {
      setIsLoading(false);
    }
  };

  // Load a game from the database
  const loadGame = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/games/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load game: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process and validate the loaded game state
      const processedGameState = {
        ...data,
        players: data.players.map((player: any) => {
          // Convert cardStatuses to a Map if it's not already
          let cardStatusesMap: Map<string, CardStatus>;
          
          if (player.cardStatuses instanceof Map) {
            cardStatusesMap = player.cardStatuses;
          } else {
            cardStatusesMap = new Map<string, CardStatus>();
            // If cardStatuses is a plain object, convert to Map
            if (player.cardStatuses && typeof player.cardStatuses === 'object') {
              Object.entries(player.cardStatuses).forEach(([key, value]) => {
                cardStatusesMap.set(key, value as CardStatus);
              });
            }
          }
          
          return {
            ...player,
            cardStatuses: cardStatusesMap
          };
        })
      };
      
      setGameState(processedGameState);
      setGameId(id);
      setIsSetup(true);
    } catch (error) {
      console.error("Error loading game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a list of recent games
  const getRecentGames = async () => {
    try {
      const response = await fetch('/api/games');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }
      
      const games = await response.json();
      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  };

  // Save the current game state to the database
  const saveGameState = async () => {
    if (!gameState || !gameId) return;
    
    try {
      // Make sure cardStatuses is properly serialized
      const cleanedState = {
        ...gameState,
        players: gameState.players.map(player => {
          // Convert Map to a plain object for serialization
          const serializedCardStatuses: Record<string, CardStatus> = {};
          player.cardStatuses.forEach((value, key) => {
            serializedCardStatuses[key] = value;
          });
          
          return {
            ...player,
            cardStatuses: serializedCardStatuses
          };
        })
      };
      
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedState),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save game state: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  // Record a suggestion made by a player
  const makeSuggestion = async (suggestionData: Omit<Suggestion, "cardShown">) => {
    if (!gameState || !gameId) return;
    
    setIsLoading(true);
    try {
      // First update local state
      const suggestion: Suggestion = { 
        ...suggestionData,
        cardShown: undefined
      };
      
      const newGameState = addSuggestionToState(gameState, suggestion);
      setGameState(newGameState);
      
      // Then save to database
      await fetch(`/api/games/${gameId}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suggestion),
      });
      
      // Finally, update the full game state in the database
      await saveGameState();
    } catch (error) {
      console.error("Error making suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Record a revealed card from a suggestion
  const revealCard = async (suggestion: Suggestion, card: Card) => {
    if (!gameState || !gameId) return;
    
    setIsLoading(true);
    try {
      // Create a new suggestion with the revealed card
      const newSuggestion: Suggestion = {
        ...suggestion,
        cardShown: card
      };
      
      // Update local state
      const newGameState = addSuggestionToState(gameState, newSuggestion);
      setGameState(newGameState);
      
      // Send to API
      await fetch(`/api/games/${gameId}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSuggestion),
      });
      
      // Update full game state
      await saveGameState();
    } catch (error) {
      console.error("Error revealing card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the status of a card for a player
  const updateCardStatus = async (playerId: number, card: Card, status: CardStatus) => {
    if (!gameState || !gameId) return;
    
    setIsLoading(true);
    try {
      // Update local state
      const newGameState = setCardStatusInState(gameState, playerId, card, status);
      setGameState(newGameState);
      
      // Update in database
      // Note: This would require an additional API endpoint that we haven't created yet
      // For now, we'll just save the full game state
      await saveGameState();
    } catch (error) {
      console.error("Error updating card status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    gameState,
    gameId,
    probabilities,
    isSetup,
    isLoading,
    initGame,
    makeSuggestion,
    revealCard,
    updateCardStatus,
    loadGame,
    getRecentGames
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
