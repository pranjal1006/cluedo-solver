import { prisma } from './db';
import { 
  Card, 
  CardStatus, 
  CardType, 
  GameState, 
  Player, 
  Room, 
  Suspect, 
  Suggestion, 
  Weapon 
} from '../types/gameTypes';
import { createRoomCard, createSuspectCard, createWeaponCard } from '../utils/cardTypeGuards';

// Define simpler types for working with Prisma data
type PrismaCard = {
  id: string;
  name: string;
  category: 'SUSPECT' | 'WEAPON' | 'ROOM';
};

type PrismaCardCategory = 'SUSPECT' | 'WEAPON' | 'ROOM';

// Mapping between our app's CardType and Prisma's CardCategory
const categoryMap: Record<CardType, PrismaCardCategory> = {
  [CardType.SUSPECT]: 'SUSPECT',
  [CardType.WEAPON]: 'WEAPON',
  [CardType.ROOM]: 'ROOM'
};

// Mapping between Prisma's CardCategory and our app's CardType
const typeMap: Record<PrismaCardCategory, CardType> = {
  'SUSPECT': CardType.SUSPECT,
  'WEAPON': CardType.WEAPON,
  'ROOM': CardType.ROOM
};

// Convert Prisma Card to App Card
function prismaCardToAppCard(card: PrismaCard): Card {
  const type = typeMap[card.category];
  
  switch (type) {
    case CardType.SUSPECT:
      return createSuspectCard(card.name as Suspect);
    case CardType.WEAPON:
      return createWeaponCard(card.name as Weapon);
    case CardType.ROOM:
      return createRoomCard(card.name as Room);
    default:
      throw new Error(`Unknown card category: ${card.category}`);
  }
}

// Create game in the database
export async function createGame(
  playerNames: string[], 
  userPosition: number, 
  userCards: Card[]
): Promise<string> {
  // Create the game
  const game = await prisma.game.create({
    data: {
      userPosition,
    }
  });

  // Create players
  const playerPromises = playerNames.map((name, index) => {
    return prisma.player.create({
      data: {
        name,
        position: index,
        isUser: index === userPosition,
        cardCount: 0, // We'll update this based on the game logic later
        gameId: game.id,
      }
    });
  });
  
  const players = await Promise.all(playerPromises);
  
  // Create cards if they don't exist
  for (const card of userCards) {
    const existingCard = await prisma.card.findFirst({
      where: {
        name: card.name,
        category: categoryMap[card.type]
      }
    });
    
    const cardId = existingCard?.id || (await prisma.card.create({
      data: {
        name: card.name,
        category: categoryMap[card.type]
      }
    })).id;
    
    // Add user cards
    await prisma.userCard.create({
      data: {
        gameId: game.id,
        cardId,
      }
    });
    
    // Set card status for all players
    for (const player of players) {
      await prisma.cardStatus.create({
        data: {
          playerId: player.id,
          cardId,
          status: player.isUser ? CardStatus.HAS : CardStatus.DOES_NOT_HAVE
        }
      });
    }
  }
  
  return game.id;
}

// Get game from database
export async function getGameById(id: string): Promise<GameState | null> {
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      players: {
        include: {
          cardStatuses: {
            include: {
              card: true
            }
          }
        },
        orderBy: {
          position: 'asc'
        }
      },
      suggestions: {
        include: {
          suggester: true,
          responder: true,
          cards: {
            include: {
              card: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      solutions: {
        include: {
          suspectCard: true,
          weaponCard: true,
          roomCard: true
        }
      }
    }
  });
  
  if (!game) return null;
  
  // Convert database models to app models
  const appPlayers: Player[] = game.players.map((player: any) => {
    const cardStatuses = new Map();
    
    player.cardStatuses.forEach((status: any) => {
      const card = prismaCardToAppCard(status.card as PrismaCard);
      cardStatuses.set(`${card.type}:${card.name}`, status.status as CardStatus);
    });
    
    return {
      id: player.position,
      name: player.name,
      isUser: player.isUser,
      cardCount: player.cardCount,
      cardStatuses
    };
  });
  
  // Convert suggestions
  const appSuggestions: Suggestion[] = game.suggestions.map((suggestion: any) => {
    const suspectCard = suggestion.cards.find((c: any) => c.card.category === 'SUSPECT')?.card;
    const weaponCard = suggestion.cards.find((c: any) => c.card.category === 'WEAPON')?.card;
    const roomCard = suggestion.cards.find((c: any) => c.card.category === 'ROOM')?.card;
    
    const shownCard = suggestion.cards.find((c: any) => c.wasShown)?.card;
    
    if (!suspectCard || !weaponCard || !roomCard) {
      throw new Error('Suggestion missing required cards');
    }
    
    return {
      playerId: suggestion.suggester.position,
      suspect: suspectCard.name as Suspect,
      weapon: weaponCard.name as Weapon,
      room: roomCard.name as Room,
      responderId: suggestion.responder ? suggestion.responder.position : null,
      cardShown: shownCard ? prismaCardToAppCard(shownCard as PrismaCard) : undefined
    };
  });
  
  // Convert solution
  const solution = {
    suspect: game.solutions?.suspectCard ? game.solutions.suspectCard.name as Suspect : null,
    weapon: game.solutions?.weaponCard ? game.solutions.weaponCard.name as Weapon : null,
    room: game.solutions?.roomCard ? game.solutions.roomCard.name as Room : null
  };
  
  return {
    players: appPlayers,
    suggestions: appSuggestions,
    solution,
    currentPlayerId: 0 // We'll set this based on the current game state
  };
}

// Add suggestion to game
export async function addSuggestion(
  gameId: string, 
  suggestion: Suggestion
): Promise<boolean> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true
      }
    });
    
    if (!game) return false;
    
    // Get players
    const suggester = game.players.find((p: any) => p.position === suggestion.playerId);
    const responder = suggestion.responderId !== null 
      ? game.players.find((p: any) => p.position === suggestion.responderId) 
      : null;
    
    if (!suggester) return false;
    
    // Get or create cards
    const suspectCard = await getOrCreateCard(suggestion.suspect, 'SUSPECT');
    const weaponCard = await getOrCreateCard(suggestion.weapon, 'WEAPON');
    const roomCard = await getOrCreateCard(suggestion.room, 'ROOM');
    
    // Create suggestion
    const dbSuggestion = await prisma.suggestion.create({
      data: {
        gameId,
        suggesterId: suggester.id,
        responderId: responder?.id,
      }
    });
    
    // Add cards to suggestion
    await Promise.all([
      prisma.suggestionCard.create({
        data: {
          suggestionId: dbSuggestion.id,
          cardId: suspectCard.id,
          wasShown: false
        }
      }),
      prisma.suggestionCard.create({
        data: {
          suggestionId: dbSuggestion.id,
          cardId: weaponCard.id,
          wasShown: false
        }
      }),
      prisma.suggestionCard.create({
        data: {
          suggestionId: dbSuggestion.id,
          cardId: roomCard.id,
          wasShown: false
        }
      })
    ]);
    
    // If a card was shown, update that record
    if (suggestion.cardShown) {
      const shownCard = await getOrCreateCard(
        suggestion.cardShown.name, 
        categoryMap[suggestion.cardShown.type]
      );
      
      await prisma.suggestionCard.updateMany({
        where: {
          suggestionId: dbSuggestion.id,
          cardId: shownCard.id
        },
        data: {
          wasShown: true
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding suggestion:', error);
    return false;
  }
}

// Save entire game state
export async function saveGameState(gameId: string, state: GameState): Promise<boolean> {
  try {
    await prisma.game.update({
      where: { id: gameId },
      data: {
        data: state as any
      }
    });
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
}

// Utility to get or create a card
async function getOrCreateCard(name: string, category: PrismaCardCategory): Promise<PrismaCard> {
  const existingCard = await prisma.card.findFirst({
    where: {
      name,
      category
    }
  });
  
  if (existingCard) return existingCard as PrismaCard;
  
  return prisma.card.create({
    data: {
      name,
      category
    }
  }) as Promise<PrismaCard>;
}

// Function to update card status
export async function updateCardStatus(
  gameId: string,
  playerId: number,
  card: Card, 
  status: CardStatus
): Promise<boolean> {
  try {
    // Find the database player
    const player = await prisma.player.findFirst({
      where: {
        gameId,
        position: playerId
      }
    });
    
    if (!player) return false;
    
    // Find or create the card
    const dbCard = await getOrCreateCard(card.name, categoryMap[card.type]);
    
    // Update or create card status
    await prisma.cardStatus.upsert({
      where: {
        playerId_cardId: {
          playerId: player.id,
          cardId: dbCard.id
        }
      },
      update: {
        status
      },
      create: {
        playerId: player.id,
        cardId: dbCard.id,
        status
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating card status:', error);
    return false;
  }
}

// Function to list recent games
export async function listRecentGames(limit: number = 10): Promise<{id: string, createdAt: Date, name?: string}[]> {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      createdAt: true,
      name: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
  
  return games;
}
