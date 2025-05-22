import { NextRequest, NextResponse } from 'next/server';
import { addSuggestion } from '@/app/lib/gameService';
import { Suggestion } from '@/app/types/gameTypes';

// POST /api/games/[id]/suggestions - Add a suggestion to a game
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    
    // Validate suggestion data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid suggestion data' },
        { status: 400 }
      );
    }
    
    // Check required fields
    const { playerId, suspect, weapon, room, responderId } = body;
    
    if (playerId === undefined) {
      return NextResponse.json(
        { error: 'playerId is required' },
        { status: 400 }
      );
    }
    
    if (!suspect) {
      return NextResponse.json(
        { error: 'suspect is required' },
        { status: 400 }
      );
    }
    
    if (!weapon) {
      return NextResponse.json(
        { error: 'weapon is required' },
        { status: 400 }
      );
    }
    
    if (!room) {
      return NextResponse.json(
        { error: 'room is required' },
        { status: 400 }
      );
    }
    
    // Add the suggestion
    const success = await addSuggestion(
      gameId, 
      body as Suggestion
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Game not found or failed to add suggestion' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to add suggestion' },
      { status: 500 }
    );
  }
}
