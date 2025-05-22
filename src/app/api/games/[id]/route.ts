import { NextRequest, NextResponse } from 'next/server';
import { getGameById, saveGameState, addSuggestion } from '@/app/lib/gameService';
import { GameState, Suggestion } from '@/app/types/gameTypes';

// GET /api/games/[id] - Get game details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const game = await getGameById(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json(
      { error: 'Failed to get game' },
      { status: 500 }
    );
  }
}

// PUT /api/games/[id] - Update game state
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    
    // Validate input
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid game state data' },
        { status: 400 }
      );
    }
    
    const success = await saveGameState(gameId, body as GameState);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Game not found or update failed' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[id] - Delete a game (not implemented yet, placeholder for future)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Not implementing delete functionality for now
  return NextResponse.json(
    { error: 'Delete functionality not implemented' },
    { status: 501 }
  );
}
