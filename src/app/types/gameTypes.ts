/**
 * Core types for the Cluedo game solver
 */

// The three types of cards in Cluedo
export enum CardType {
  SUSPECT = 'SUSPECT',
  WEAPON = 'WEAPON',
  ROOM = 'ROOM'
}

// All suspects in the game
export enum Suspect {
  COLONEL_MUSTARD = 'Colonel Mustard',
  PROFESSOR_PLUM = 'Professor Plum',
  REVEREND_GREEN = 'Reverend Green',
  MRS_PEACOCK = 'Mrs. Peacock',
  MISS_SCARLETT = 'Miss Scarlett',
  MRS_WHITE = 'Mrs. White'
}

// All weapons in the game
export enum Weapon {
  CANDLESTICK = 'Candlestick',
  KNIFE = 'Knife',
  LEAD_PIPE = 'Lead Pipe',
  REVOLVER = 'Revolver',
  ROPE = 'Rope',
  WRENCH = 'Wrench'
}

// All rooms in the game
export enum Room {
  KITCHEN = 'Kitchen',
  BALLROOM = 'Ballroom',
  CONSERVATORY = 'Conservatory',
  BILLIARD_ROOM = 'Billiard Room',
  LIBRARY = 'Library',
  STUDY = 'Study',
  HALL = 'Hall',
  LOUNGE = 'Lounge',
  DINING_ROOM = 'Dining Room'
}

// Cards are defined using a discriminated union pattern for better type safety
export type SuspectCard = {
  type: CardType.SUSPECT;
  name: Suspect;
};

export type WeaponCard = {
  type: CardType.WEAPON;
  name: Weapon;
};

export type RoomCard = {
  type: CardType.ROOM;
  name: Room;
};

export type Card = SuspectCard | WeaponCard | RoomCard;

// Status of a card in relation to a player
export enum CardStatus {
  HAS = 'HAS',           // Player definitely has this card
  DOES_NOT_HAVE = 'DOES_NOT_HAVE', // Player definitely doesn't have this card
  MAYBE_HAS = 'MAYBE_HAS',     // Player might have this card (from a suggestion)
  UNKNOWN = 'UNKNOWN'     // Default state - we don't know anything
}

// Player information
export type Player = {
  id: number;
  name: string;
  isUser: boolean; // Whether this player is the user
  cardCount: number; // Number of cards the player has
  cardStatuses: Map<string, CardStatus>; // Status of each card for this player
};

// Suggestion made by a player
export type Suggestion = {
  playerId: number; // Player who made the suggestion
  suspect: Suspect;
  weapon: Weapon;
  room: Room;
  responderId: number | null; // Player who showed a card (or null if no one showed)
  cardShown?: Card; // Card that was shown (only visible if shown to the user)
};

// Game state
export type GameState = {
  players: Player[];
  suggestions: Suggestion[];
  solution: {
    suspect: Suspect | null;
    weapon: Weapon | null;
    room: Room | null;
  };
  currentPlayerId: number;
};

// Probability information for cards
export type CardProbability = {
  card: Card;
  inSolution: number; // Probability the card is in the solution (0-1)
  playerProbabilities: Map<number, number>; // Probability each player has the card (0-1)
};
