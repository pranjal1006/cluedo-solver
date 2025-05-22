# Cluedo Solver

A web application to help you play and solve Cluedo (Clue) board games by tracking information and calculating probabilities.

## Features

- 🎮 Track all information about your Cluedo game in real-time
- 🧩 Record suggestions and responses as the game progresses
- 📊 View probability calculations for each card's location
- 🔍 Automatically makes logical deductions based on gathered information  
- 💾 Save and load games from database

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cluedo-solver.git
cd cluedo-solver
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory based on `.env.example`:

```
# For local development
DATABASE_URL="postgresql://username:password@localhost:5432/cluedo_solver?schema=public"

# For Vercel deployment with Vercel Postgres
# DATABASE_URL="postgres://user:password@host:port/database"
# DIRECT_URL="postgres://user:password@host:port/database"
```

4. Set up the database:

```bash
# Create the database tables
npx prisma migrate dev --name init
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Deployment

### Deploying to Vercel

1. Create a new Postgres database in Vercel.

2. Connect your GitHub repository to Vercel.

3. In the Vercel project settings, ensure the Postgres connection strings are set up properly.

4. Deploy the app.

5. After deploying, run the Prisma migrations against your production database:

```bash
npx prisma migrate deploy
```

## How to Use

1. **Set up a new game**: Enter player names, select your position, and select the cards in your hand.

2. **Record suggestions**: As players make suggestions during the game, record them in the app.

3. **Check the probability card**: Use the toggle to view the probability card, which shows the likelihood of each card being in specific locations.

4. **Use the deductions**: The app automatically makes logical deductions, which will be reflected in the UI.

## Documentation

For more information, see the docs directory:

- [User Guide](docs/user-guide.md) - Instructions for using the application
- [Developer Guide](docs/developer-guide.md) - Information about the code architecture and implementation
- [API Documentation](docs/api-documentation.md) - Details about the API endpoints

## License

MIT
