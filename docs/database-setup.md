# Database Setup for Cluedo Solver

This guide will help you set up the database for the Cluedo Solver application.

## Prerequisites

- PostgreSQL installed locally or access to a PostgreSQL database service
- Access to the database via `psql` or another SQL client
- Environment variables properly configured in `.env`

## Local PostgreSQL Setup

### 1. Create a Database

First, connect to PostgreSQL using the psql command-line tool:

```bash
psql -U postgres
```

Create a new database for the application:

```sql
CREATE DATABASE cluedo_solver;
```

### 2. Create a User (Optional)

Create a dedicated user for the application:

```sql
CREATE USER cluedo_user WITH ENCRYPTED PASSWORD 'your_secure_password';
```

Grant necessary privileges to the user:

```sql
GRANT ALL PRIVILEGES ON DATABASE cluedo_solver TO cluedo_user;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory of your project with the following content:

```
DATABASE_URL="postgresql://cluedo_user:your_secure_password@localhost:5432/cluedo_solver?schema=public"
```

## Vercel Postgres Setup

If you're using Vercel Postgres:

1. Create a new Postgres database from the Vercel dashboard
2. Connect your project to the database
3. Set up the environment variables automatically or manually:

```
DATABASE_URL="postgres://..."  # Connection string provided by Vercel
DIRECT_URL="postgres://..."    # Direct connection string provided by Vercel
```

## Database Migration

After setting up the database and environment variables, run the migration to create the tables:

```bash
npx prisma migrate dev --name init
```

This command will:
1. Generate the Prisma client based on the schema
2. Create all necessary tables in the database
3. Apply the database schema defined in `prisma/schema.prisma`

For production deployments, use:

```bash
npx prisma migrate deploy
```

## Database Schema

The Cluedo Solver uses the following models:

- **Game**: Stores game information, relationships, and serialized game state
- **Player**: Stores player information including name, position, and card count
- **Card**: Represents all cards in the game (suspects, weapons, rooms)
- **CardStatus**: Tracks status of each card for each player
- **Suggestion**: Records suggestions made during gameplay
- **SuggestionCard**: Links cards to suggestions
- **Solution**: Stores the solution cards for a game

The complete schema can be found in the `prisma/schema.prisma` file.

## Testing the Connection

To verify that your database connection is working correctly:

```bash
npx prisma db pull
```

This should retrieve the current database schema without errors if the connection is successful.

## Troubleshooting

### Connection Issues

- Make sure your PostgreSQL server is running
- Verify that the database and user exist
- Check that the port in your connection string is correct
- Ensure your password is properly URL-encoded in the connection string

### Migration Issues

If you encounter issues with migrations:

```bash
# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset

# Then try migrating again
npx prisma migrate dev --name init
```

### Prisma Client Generation Issues

If the Prisma client is out of sync with your schema:

```bash
npx prisma generate
```

This will regenerate the client based on the current schema.
