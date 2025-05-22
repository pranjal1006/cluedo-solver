# Cluedo Solver - Developer Guide

This document provides technical information about the implementation of the Cluedo Solver application.

## Architecture Overview

The Cluedo Solver is built using Next.js with TypeScript and React, using the app router architecture. The application uses:

- **TypeScript** for type safety
- **React Context API** for state management
- **TailwindCSS** for styling

### Directory Structure

```
src/
├── app/
│   ├── components/        # React components
│   ├── models/            # Data models and context
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions and game logic
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
```

## Core Types

The application's data model is defined in `src/app/types/gameTypes.ts` and includes:

- **Card**: Represents a card in the game (suspect, weapon, or room)
- **CardType**: Enum for the three types of cards
- **CardStatus**: Enum for the status of a card in relation to a player (has, doesn't have, maybe has)
- **Player**: Contains player information and card statuses
- **Suggestion**: Represents a suggestion made in the game
- **GameState**: The overall state of the game
- **CardProbability**: Probability information for a card

## Game Logic

The core game logic is implemented in `src/app/utils/gameLogic.ts` and includes:

### Key Functions

- **initializeGame**: Creates a new game state with the specified players and user cards
- **addSuggestion**: Records a suggestion and updates the game state
- **makeDeductions**: Applies deduction rules to update the game state
- **calculateProbabilities**: Computes probabilities for all cards based on known information

### Deduction Algorithms

The solver employs several deduction strategies:

1. **Solution by Elimination**: If all but one card of a type is known to be held by players, the remaining one must be in the solution.

2. **Player Card Deductions**: If a player has N cards and we've identified (N-1) cards, the Nth card must be one of the "maybe" cards.

3. **Remaining Player Cards**: If we've identified all of a player's cards, they can't have any others.

4. **Common Elimination**: If all players don't have a specific card, it must be in the solution.

### Type Guards

Type guards in `src/app/utils/cardTypeGuards.ts` help with TypeScript type narrowing and card creation:

- **isSuspectCard/isWeaponCard/isRoomCard**: Type guard functions
- **createSuspectCard/createWeaponCard/createRoomCard**: Helper functions for creating card objects

## State Management

Game state is managed through React Context in `src/app/models/GameContext.tsx`:

- **GameContextProvider**: Provides game state and functions to the app
- **useGameContext**: Hook for components to access the game context

Key functions exposed through context:
- **initGame**: Initialize a new game
- **makeSuggestion**: Record a new suggestion
- **updateCardStatus**: Update the status of a card for a player
- **revealCard**: Record a revealed card from a suggestion

## User Interface Components

### GameSetup.tsx

Handles the initial game setup:
- Player configuration
- Card selection
- Game initialization

### GameBoard.tsx

Main game interface with:
- Player and solution display
- Interactive probability card (toggleable)
- Suggestion form and history
- Color-coded probability visualization

## Probability Calculation

The probability calculation algorithm:

1. Takes into account which cards are known to be held by players
2. Considers which cards are known not to be held by players
3. Calculates the probability for each card to be in the solution
4. Calculates the probability for each card to be held by each player

The algorithm accounts for:
- How many cards each player has in total
- How many cards have already been assigned to each player
- How many "slots" remain for unknown cards

## Extension Points

To extend the application:

1. **Add new deduction rules**: Update the `makeDeductions` function in `gameLogic.ts`
2. **Improve probability calculations**: Enhance the `calculateProbabilities` function
3. **Add card reveal functionality**: Implement a UI for explicitly revealing a card when shown to you
4. **Game state persistence**: Add localStorage or database storage for game state

## Future Improvements

Potential areas for enhancement:

1. **Game state persistence**: Save and load games
2. **Card reveal UI**: Adding ability to record which card was shown to you
3. **Visual improvements**: Better visualization of deductions and probabilities
4. **Game notes**: Add note-taking functionality for player strategies
5. **Statistics**: Track success rates and game duration
