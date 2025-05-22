# Cluedo Solver - User Guide

This guide explains how to use the Cluedo Solver application to help you track information and deduce the solution while playing Cluedo.

## Getting Started

1. Navigate to the application URL or run it locally
2. You'll be presented with the Game Setup screen

## Game Setup

### Setting Up Players

1. Use the dropdown to select the number of players in your game (3-6)
2. Enter each player's name
3. Select "This is me" for your player
4. Select all the cards you have in your hand by checking the appropriate boxes in the Suspects, Weapons, and Rooms sections

### Starting the Game

Click the "Start Game" button to begin tracking your game. The application will initialize with the following information:

- All players and their card counts
- Your cards (marked as "known" for you and "not held" for other players)
- Initial probabilities for all cards

## During Gameplay

### Viewing Current Information

The main game screen shows:

1. **Players** - A list of all players, with your player highlighted
2. **Solution** - The current known information about the solution
3. **Probability Card** - Toggle this to see the probability data for all cards
4. **Suggestion History** - A record of all suggestions made during the game

### The Probability Card

The probability card shows:

- For each card (suspect, weapon, or room):
  - The probability it's in the solution
  - The probability each player has the card
  - Color coding to visualize probabilities

Color coding:

- **Green**: High probability/Known to have
- **Yellow**: Moderate probability/May have
- **Red**: Zero probability/Known not to have
- **Gray**: Unknown status

### Recording a Suggestion

When a player makes a suggestion:

1. Open the "Record Suggestion" section
2. Select the player who made the suggestion
3. Select the suspect, weapon, and room that were suggested
4. Select the player who responded (if any)
5. Click "Record Suggestion"

The application will:
- Track who responded to which suggestions
- Update probabilities based on this new information
- Make logical deductions that may reveal more information

### Viewing Suggestion History

All recorded suggestions appear in the "Suggestion History" section, showing:
- Who made the suggestion
- The suspect, weapon, and room suggested
- Who responded (if anyone)
- Which card was shown (if known to you)

## Tips for Effective Use

1. **Record suggestions promptly**: Enter all suggestions as they happen in the game to keep information accurate
2. **Pay attention to probabilities**: The probability card can give you insights that may not be obvious
3. **Look for high-probability cards**: Cards with high solution probability are good candidates for your final accusation
4. **Track player patterns**: Notice which players respond to which suggestions to narrow down what cards they might have

## Resetting the Game

Currently, to start a new game you need to refresh the page and go through the setup process again.
