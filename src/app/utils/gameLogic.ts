import { 
  Card,
  CardStatus, 
  CardType, 
  GameState, 
  Player, 
  Room, 
  Suspect, 
  Suggestion, 
  Weapon,
  CardProbability
} from "../types/gameTypes";
import { 
  isRoomCard, 
  isSuspectCard, 
  isWeaponCard,
  createSuspectCard,
  createWeaponCard,
  createRoomCard
} from "./cardTypeGuards";

/**
 * Initialize a new game with the given players and user cards
 * 
 * @param playerNames Names of all players in clockwise order
 * @param userPosition Position of the user (0-based index in playerNames)
 * @param userCards Cards that the user has
 * @param cardsPerPlayer Number of cards each player has (if known, otherwise estimate)
 * @returns A new game state
 */
export function initializeGame(
  playerNames: string[], 
  userPosition: number, 
  userCards: Card[], 
  cardsPerPlayer?: number[]
): GameState {
  // Validate inputs
  if (playerNames.length < 2) {
    throw new Error("Game must have at least 2 players");
  }
  
  if (userPosition < 0 || userPosition >= playerNames.length) {
    throw new Error("User position must be within the list of players");
  }
  
  // Calculate total cards excluding solution cards (3)
  const totalCards = Object.keys(Suspect).length + 
                     Object.keys(Weapon).length + 
                     Object.keys(Room).length - 3;
                     
  let players: Player[] = [];
  
  // Create players
  for (let i = 0; i < playerNames.length; i++) {
    const cardCount = cardsPerPlayer?.[i] ?? Math.floor(totalCards / playerNames.length);
    
    players.push({
      id: i,
      name: playerNames[i],
      isUser: i === userPosition,
      cardCount,
      cardStatuses: new Map()
    });
  }
  
  // Initialize with all cards as unknown for all players
  const allCards = getAllCards();
  for (const player of players) {
    for (const card of allCards) {
      player.cardStatuses.set(getCardKey(card), CardStatus.UNKNOWN);
    }
  }
  
  // Set user's cards
  for (const card of userCards) {
    players[userPosition].cardStatuses.set(getCardKey(card), CardStatus.HAS);
    
    // Mark this card as not in other players' hands
    for (let i = 0; i < players.length; i++) {
      if (i !== userPosition) {
        players[i].cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
      }
    }
  }
  
  return {
    players,
    suggestions: [],
    solution: {
      suspect: null,
      weapon: null,
      room: null
    },
    currentPlayerId: 0
  };
}

/**
 * Generate a unique key for a card
 */
export function getCardKey(card: Card): string {
  return `${card.type}:${card.name}`;
}

/**
 * Get all cards in the game
 */
export function getAllCards(): Card[] {
  const cards: Card[] = [];
  
  // Add suspects
  Object.values(Suspect).forEach(suspect => {
    cards.push(createSuspectCard(suspect));
  });
  
  // Add weapons
  Object.values(Weapon).forEach(weapon => {
    cards.push(createWeaponCard(weapon));
  });
  
  // Add rooms
  Object.values(Room).forEach(room => {
    cards.push(createRoomCard(room));
  });
  
  return cards;
}

/**
 * Get all cards of a specific type
 */
export function getCardsByType(type: CardType): Card[] {
  const allCards = getAllCards();
  return allCards.filter(card => card.type === type);
}

/**
 * Add a suggestion to the game state and update knowledge
 * 
 * @param state Current game state
 * @param suggestion The suggestion being added
 * @returns Updated game state
 */
export function addSuggestion(state: GameState, suggestion: Suggestion): GameState {
  const newState = { ...state };
  newState.suggestions = [...state.suggestions, suggestion];
  
  // If no one responded, everyone except the suggester doesn't have these cards
  if (suggestion.responderId === null) {
    for (let i = 0; i < newState.players.length; i++) {
      if (i !== suggestion.playerId) {
        const cards = [
          createSuspectCard(suggestion.suspect),
          createWeaponCard(suggestion.weapon),
          createRoomCard(suggestion.room)
        ];
        
        cards.forEach(card => {
          if (newState.players[i].cardStatuses.get(getCardKey(card)) !== CardStatus.HAS) {
            newState.players[i].cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
          }
        });
      }
    }
    
    // These cards might be in the solution
    return makeDeductions(newState);
  }
  
  // If someone responded but we don't know the card they showed
  if (suggestion.responderId !== null && !suggestion.cardShown) {
    const responder = newState.players[suggestion.responderId];
    
    // Responder has at least one of these cards
    const suggestedCards = [
      createSuspectCard(suggestion.suspect),
      createWeaponCard(suggestion.weapon),
      createRoomCard(suggestion.room)
    ];
    
    // Mark all players who passed as not having any of the cards
    let currentPlayerId = (suggestion.playerId + 1) % newState.players.length;
    
    while (currentPlayerId !== suggestion.responderId) {
      const player = newState.players[currentPlayerId];
      
      suggestedCards.forEach(card => {
        if (player.cardStatuses.get(getCardKey(card)) !== CardStatus.HAS) {
          player.cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
        }
      });
      
      currentPlayerId = (currentPlayerId + 1) % newState.players.length;
    }
    
    // Mark responder as maybe having these cards
    suggestedCards.forEach(card => {
      if (responder.cardStatuses.get(getCardKey(card)) === CardStatus.UNKNOWN) {
        responder.cardStatuses.set(getCardKey(card), CardStatus.MAYBE_HAS);
      }
    });
  }
  
  // If we know which card was shown
  if (suggestion.cardShown) {
    // The responder has this card
    newState.players[suggestion.responderId!].cardStatuses.set(
      getCardKey(suggestion.cardShown), 
      CardStatus.HAS
    );
    
    // No other player has this card
    newState.players.forEach((player, idx) => {
      if (idx !== suggestion.responderId) {
        player.cardStatuses.set(
          getCardKey(suggestion.cardShown!), 
          CardStatus.DOES_NOT_HAVE
        );
      }
    });
    
    // Mark all players who passed as not having any of the cards
    const suggestedCards = [
      createSuspectCard(suggestion.suspect),
      createWeaponCard(suggestion.weapon),
      createRoomCard(suggestion.room)
    ];
    
    let currentPlayerId = (suggestion.playerId + 1) % newState.players.length;
    
    while (currentPlayerId !== suggestion.responderId) {
      const player = newState.players[currentPlayerId];
      
      suggestedCards.forEach(card => {
        if (player.cardStatuses.get(getCardKey(card)) !== CardStatus.HAS) {
          player.cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
        }
      });
      
      currentPlayerId = (currentPlayerId + 1) % newState.players.length;
    }
  }
  
  return makeDeductions(newState);
}

/**
 * Make logical deductions based on current knowledge
 * This function applies various deduction rules to update card statuses
 */
export function makeDeductions(state: GameState): GameState {
  const newState = { ...state };
  let changed = true;
  
  // Keep making deductions until no new information is gained
  while (changed) {
    changed = false;
    
    // If all but one card of a type is assigned, the last one must be in the solution
    changed = deduceSolutionByElimination(newState) || changed;
    
    // If a player must have a specific card based on process of elimination
    changed = deduceCardsByPlayerCounts(newState) || changed;
    
    // If a player has N cards and we've identified N cards, all others must be "does not have"
    changed = deduceRemainingPlayerCards(newState) || changed;
    
    // If everyone doesn't have a card, it must be in the solution
    changed = deduceSolutionByCommonElimination(newState) || changed;
  }
  
  return newState;
}

/**
 * Deduce solution by elimination:
 * If all but one card of a type is known to be held by players, the remaining one must be in the solution
 */
function deduceSolutionByElimination(state: GameState): boolean {
  let changed = false;
  
  // Check for each card type (suspect, weapon, room)
  [CardType.SUSPECT, CardType.WEAPON, CardType.ROOM].forEach(type => {
    const cards = getCardsByType(type);
    let unknownCard: Card | null = null;
    let unknownCount = 0;
    
    // Count how many cards have unknown locations
    cards.forEach(card => {
      let isAssigned = false;
      
      // Check if any player definitely has this card
      for (const player of state.players) {
        if (player.cardStatuses.get(getCardKey(card)) === CardStatus.HAS) {
          isAssigned = true;
          break;
        }
      }
      
      if (!isAssigned) {
        unknownCount++;
        unknownCard = card;
      }
    });
    
    // If only one card's location is unknown, it must be in the solution
    if (unknownCount === 1 && unknownCard) {
      if (type === CardType.SUSPECT) {
        // It must be a suspect card
        const suspectCard = unknownCard as { type: CardType.SUSPECT, name: Suspect };
        if (state.solution.suspect !== suspectCard.name) {
          state.solution.suspect = suspectCard.name;
          changed = true;
        }
      } else if (type === CardType.WEAPON) {
        // It must be a weapon card
        const weaponCard = unknownCard as { type: CardType.WEAPON, name: Weapon };
        if (state.solution.weapon !== weaponCard.name) {
          state.solution.weapon = weaponCard.name;
          changed = true;
        }
      } else if (type === CardType.ROOM) {
        // It must be a room card
        const roomCard = unknownCard as { type: CardType.ROOM, name: Room };
        if (state.solution.room !== roomCard.name) {
          state.solution.room = roomCard.name;
          changed = true;
        }
      }
      
      // Once we know a card is in the solution, no player can have it
      state.players.forEach(player => {
        if (player.cardStatuses.get(getCardKey(unknownCard!)) !== CardStatus.DOES_NOT_HAVE) {
          player.cardStatuses.set(getCardKey(unknownCard!), CardStatus.DOES_NOT_HAVE);
          changed = true;
        }
      });
    }
  });
  
  return changed;
}

/**
 * If a player has N cards and we've identified (N-1) cards, the Nth card must be
 * one of the "maybe" cards they possess
 */
function deduceCardsByPlayerCounts(state: GameState): boolean {
  let changed = false;
  
  state.players.forEach(player => {
    // Count definitive cards
    let hasCount = 0;
    let maybeCards: Card[] = [];
    
    getAllCards().forEach(card => {
      const status = player.cardStatuses.get(getCardKey(card));
      if (status === CardStatus.HAS) {
        hasCount++;
      } else if (status === CardStatus.MAYBE_HAS) {
        maybeCards.push(card);
      }
    });
    
    // If player has N cards total, and we've identified N-1 cards, and there's only one "maybe" card,
    // then they must have that last card
    if (hasCount === player.cardCount - 1 && maybeCards.length === 1) {
      player.cardStatuses.set(getCardKey(maybeCards[0]), CardStatus.HAS);
      
      // No other player can have this card
      state.players.forEach(otherPlayer => {
        if (otherPlayer.id !== player.id) {
          if (otherPlayer.cardStatuses.get(getCardKey(maybeCards[0])) !== CardStatus.DOES_NOT_HAVE) {
            otherPlayer.cardStatuses.set(getCardKey(maybeCards[0]), CardStatus.DOES_NOT_HAVE);
            changed = true;
          }
        }
      });
      
      changed = true;
    }
  });
  
  return changed;
}

/**
 * If a player has N cards and we've identified N cards as "has", 
 * all other cards must be "does not have"
 */
function deduceRemainingPlayerCards(state: GameState): boolean {
  let changed = false;
  
  state.players.forEach(player => {
    // Count definitive cards
    let hasCount = 0;
    
    getAllCards().forEach(card => {
      const status = player.cardStatuses.get(getCardKey(card));
      if (status === CardStatus.HAS) {
        hasCount++;
      }
    });
    
    // If we've identified all their cards, they can't have any others
    if (hasCount === player.cardCount) {
      getAllCards().forEach(card => {
        const status = player.cardStatuses.get(getCardKey(card));
        if (status !== CardStatus.HAS && status !== CardStatus.DOES_NOT_HAVE) {
          player.cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
          changed = true;
        }
      });
    }
  });
  
  return changed;
}

/**
 * If all players don't have a specific card, it must be in the solution
 */
function deduceSolutionByCommonElimination(state: GameState): boolean {
  let changed = false;
  
  getAllCards().forEach(card => {
    let allPlayersLackCard = true;
    
    for (const player of state.players) {
      if (player.cardStatuses.get(getCardKey(card)) !== CardStatus.DOES_NOT_HAVE) {
        allPlayersLackCard = false;
        break;
      }
    }
    
    if (allPlayersLackCard) {
      // Use type assertions for safety
      if (card.type === CardType.SUSPECT) {
        const suspect = card.name as Suspect;
        if (state.solution.suspect !== suspect) {
          state.solution.suspect = suspect;
          changed = true;
        }
      } else if (card.type === CardType.WEAPON) {
        const weapon = card.name as Weapon;
        if (state.solution.weapon !== weapon) {
          state.solution.weapon = weapon;
          changed = true;
        }
      } else if (card.type === CardType.ROOM) {
        const room = card.name as Room;
        if (state.solution.room !== room) {
          state.solution.room = room;
          changed = true;
        }
      }
    }
  });
  
  return changed;
}

/**
 * Calculate probabilities for all cards based on current knowledge
 * 
 * @param state Current game state
 * @returns Array of card probabilities
 */
export function calculateProbabilities(state: GameState): CardProbability[] {
  const probabilities: CardProbability[] = [];
  const allCards = getAllCards();
  
  // Create initial probability objects
  allCards.forEach(card => {
    const cardProb: CardProbability = {
      card,
      inSolution: 0,
      playerProbabilities: new Map()
    };
    
    // Initialize player probabilities
    state.players.forEach(player => {
      cardProb.playerProbabilities.set(player.id, 0);
    });
    
    probabilities.push(cardProb);
  });
  
  // Update probabilities based on known information
  probabilities.forEach(prob => {
    const card = prob.card;
    
    // Check if this card is known to be in the solution
    if (card.type === CardType.SUSPECT) {
      const suspect = card.name as Suspect;
      if (state.solution.suspect === suspect) {
        prob.inSolution = 1;
        return; // Skip further calculations for this card
      }
    } else if (card.type === CardType.WEAPON) {
      const weapon = card.name as Weapon;
      if (state.solution.weapon === weapon) {
        prob.inSolution = 1;
        return; // Skip further calculations for this card
      }
    } else if (card.type === CardType.ROOM) {
      const room = card.name as Room;
      if (state.solution.room === room) {
        prob.inSolution = 1;
        return; // Skip further calculations for this card
      }
    }
    
    // Check if any player definitely has this card
    let isAssignedToPlayer = false;
    
    for (const player of state.players) {
      const status = player.cardStatuses.get(getCardKey(card));
      
      if (status === CardStatus.HAS) {
        prob.playerProbabilities.set(player.id, 1);
        isAssignedToPlayer = true;
      } else if (status === CardStatus.DOES_NOT_HAVE) {
        prob.playerProbabilities.set(player.id, 0);
      }
    }
    
    // If the card is assigned to a player, it can't be in the solution
    if (isAssignedToPlayer) {
      prob.inSolution = 0;
      return;
    }
    
    // Count players who might have this card and how many unassigned cards they have
    let possiblePlayers = 0;
    let totalUnassignedSlots = 0;
    
    state.players.forEach(player => {
      const status = player.cardStatuses.get(getCardKey(card));
      
      if (status !== CardStatus.DOES_NOT_HAVE) {
        possiblePlayers++;
        
        // Count how many cards this player already has
        let hasCount = 0;
        allCards.forEach(c => {
          if (player.cardStatuses.get(getCardKey(c)) === CardStatus.HAS) {
            hasCount++;
          }
        });
        
        // Unassigned slots = total cards - cards already assigned
        const unassignedSlots = player.cardCount - hasCount;
        if (unassignedSlots > 0) {
          totalUnassignedSlots += unassignedSlots;
        }
      }
    });
    
    // If no player can have this card, it must be in the solution
    if (possiblePlayers === 0 || totalUnassignedSlots === 0) {
      prob.inSolution = 1;
      return;
    }
    
    // Calculate solution probability (if not already determined)
    // Solution probability is 1/(totalPossibleLocations)
    const totalPossibleLocations = totalUnassignedSlots + 1; // +1 for solution
    prob.inSolution = 1 / totalPossibleLocations;
    
    // Calculate player probabilities
    state.players.forEach(player => {
      const status = player.cardStatuses.get(getCardKey(card));
      
      if (status !== CardStatus.DOES_NOT_HAVE && status !== CardStatus.HAS) {
        // Count how many cards this player already has
        let hasCount = 0;
        allCards.forEach(c => {
          if (player.cardStatuses.get(getCardKey(c)) === CardStatus.HAS) {
            hasCount++;
          }
        });
        
        // Unassigned slots = total cards - cards already assigned
        const unassignedSlots = player.cardCount - hasCount;
        
        if (unassignedSlots > 0) {
          // Probability = unassigned slots for this player / total possible locations
          prob.playerProbabilities.set(
            player.id, 
            unassignedSlots / totalPossibleLocations
          );
        }
      }
    });
  });
  
  return probabilities;
}

/**
 * Helper function to set the card status for a player and update knowledge
 * 
 * @param state Current game state
 * @param playerId The player who has or doesn't have the card
 * @param card The card to update
 * @param status The new card status
 * @returns Updated game state
 */
export function setCardStatus(
  state: GameState, 
  playerId: number, 
  card: Card, 
  status: CardStatus
): GameState {
  const newState = { ...state };
  const player = newState.players[playerId];
  
  player.cardStatuses.set(getCardKey(card), status);
  
  // If a player has a card, no one else can have it
  if (status === CardStatus.HAS) {
    newState.players.forEach((p, idx) => {
      if (idx !== playerId) {
        p.cardStatuses.set(getCardKey(card), CardStatus.DOES_NOT_HAVE);
      }
    });
  }
  
  return makeDeductions(newState);
}
