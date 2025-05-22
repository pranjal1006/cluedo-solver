import { NextRequest, NextResponse } from 'next/server';
import { createGame, listRecentGames } from '@/app/lib/gameService';
import { Card } from '@/app/types/gameTypes';

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { playerNames, userPosition, userCards } = body;
    
    if (!playerNames || !Array.isArray(playerNames) || playerNames.length < 2) {
      return NextResponse.json(
        { error: 'playerNames must be an array with at least 2 players' },
        { status: 400 }
      );
    }
    
    if (userPosition === undefined || userPosition < 0 || userPosition >= playerNames.length) {
      return NextResponse.json(
        { error: 'userPosition must be a valid index in the playerNames array' },
        { status: 400 }
      );
    }
    
    if (!userCards || !Array.isArray(userCards) || userCards.length === 0) {
      return NextResponse.json(
        { error: 'userCards must be a non-empty array of cards' },
        { status: 400 }
      );
    }
    
    // Create the game
    const gameId = await createGame(
      playerNames, 
      userPosition, 
      userCards as Card[]
    );
    
    return NextResponse.json({ gameId }, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

// GET /api/games - List recent games
export async function GET() {
  try {
    const games = await listRecentGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error listing games:', error);
    return NextResponse.json(
      { error: 'Failed to list games' },
      { status: 500 }
    );
  }
}
