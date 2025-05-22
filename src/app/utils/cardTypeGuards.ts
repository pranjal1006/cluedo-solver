import { Card, CardType, Room, RoomCard, Suspect, SuspectCard, Weapon, WeaponCard } from "../types/gameTypes";

// Type guard functions to check card types
export function isSuspectCard(card: Card): card is SuspectCard {
  return card.type === CardType.SUSPECT;
}

export function isWeaponCard(card: Card): card is WeaponCard {
  return card.type === CardType.WEAPON;
}

export function isRoomCard(card: Card): card is RoomCard {
  return card.type === CardType.ROOM;
}

// Helper functions to create cards
export function createSuspectCard(suspect: Suspect): SuspectCard {
  return { type: CardType.SUSPECT, name: suspect };
}

export function createWeaponCard(weapon: Weapon): WeaponCard {
  return { type: CardType.WEAPON, name: weapon };
}

export function createRoomCard(room: Room): RoomCard {
  return { type: CardType.ROOM, name: room };
}
