# Cluedo Solver

This Cluedo Solver application helps players track information and deduce the solution while playing the board game Cluedo (also known as Clue).

## About Cluedo

Cluedo is a popular murder mystery game where players try to determine:
- Which suspect committed the murder
- Which weapon was used
- In which room the murder took place

During gameplay, players make suggestions about these three elements, and other players reveal cards that disprove these suggestions. Through process of elimination and deduction, players work towards identifying the solution.

## How the Solver Helps

This application:

1. **Tracks game information:** Player names, your cards, and the suggestions made during the game
2. **Records suggestions and responses:** As the game progresses, record each suggestion and who responded
3. **Calculates probabilities:** Using the information gathered, the solver calculates the probability that each card is in the solution or held by a particular player
4. **Makes deductions:** The solver applies logical rules to deduce information that may not be immediately obvious

## Documentation

For more information, see:

- [User Guide](./user-guide.md) - Instructions for using the application
- [Developer Guide](./developer-guide.md) - Information about the code architecture and implementation
