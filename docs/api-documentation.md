# Cluedo Solver API Documentation

This document describes the API endpoints available for the Cluedo Solver application.

## Base URL

For local development: `http://localhost:3000/api`
For production: Your deployed domain with `/api`

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `400 Bad Request`: The request was invalid
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with an `error` property containing a description of the error:

```json
{
  "error": "Description of the error"
}
```

## Endpoints

### Games

#### List Games

```
GET /games
```

Returns a list of recent games.

**Response**

```json
[
  {
    "id": "game_id_1",
    "createdAt": "2025-05-22T18:30:00.000Z",
    "name": "Game 1"
  },
  {
    "id": "game_id_2",
    "createdAt": "2025-05-22T19:45:00.000Z"
  }
]
```

#### Create Game

```
POST /games
```

Creates a new game.

**Request Body**

```json
{
  "playerNames": ["Player 1", "Player 2", "Player 3"],
  "userPosition": 0,
  "userCards": [
    { "type": "SUSPECT", "name": "Colonel Mustard" },
    { "type": "WEAPON", "name": "Candlestick" },
    { "type": "ROOM", "name": "Kitchen" }
  ],
  "cardsPerPlayer": [3, 3, 3]
}
```

**Response**

```json
{
  "gameId": "new_game_id"
}
```

#### Get Game

```
GET /games/:id
```

Returns details about a specific game.

**Response**

```json
{
  "players": [
    {
      "id": 0,
      "name": "Player 1",
      "isUser": true,
      "cardCount": 3,
      "cardStatuses": {} // Map of card statuses
    }
  ],
  "suggestions": [],
  "solution": {
    "suspect": null,
    "weapon": null,
    "room": null
  },
  "currentPlayerId": 0
}
```

#### Update Game State

```
PUT /games/:id
```

Updates the state of a specific game.

**Request Body**

```json
{
  "players": [...],
  "suggestions": [...],
  "solution": {...},
  "currentPlayerId": 1
}
```

**Response**

```json
{
  "success": true
}
```

### Suggestions

#### Add Suggestion

```
POST /games/:id/suggestions
```

Adds a suggestion to a specific game.

**Request Body**

```json
{
  "playerId": 0,
  "suspect": "Colonel Mustard",
  "weapon": "Candlestick",
  "room": "Kitchen",
  "responderId": 1,
  "cardShown": { "type": "SUSPECT", "name": "Colonel Mustard" } // Optional
}
```

**Response**

```json
{
  "success": true
}
```

## Database Schema

The application uses PostgreSQL with the following schema:

- **Game**: Stores game information, players, and relationships
- **Player**: Stores player information and card counts
- **Card**: Stores card information (suspects, weapons, rooms)
- **CardStatus**: Tracks the status of each card for each player
- **Suggestion**: Records suggestions made during the game
- **Solution**: Stores the solution for a game

## Environment Variables

To connect to the database, the following environment variables are needed:

```
DATABASE_URL=postgresql://user:password@localhost:5432/cluedo_solver
```

For deployment on Vercel with a Postgres database, both `DATABASE_URL` and `DIRECT_URL` are needed:

```
DATABASE_URL=postgres://...
DIRECT_URL=postgres://...
