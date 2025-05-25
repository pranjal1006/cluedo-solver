# Cluedo Solver Troubleshooting Guide

This document contains solutions to common issues you might encounter when using the Cluedo Solver application.

## Client-Side Rendering Issues

### Hydration Mismatch Errors

If you see errors like:
```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Solution:**
- The application uses a hydration guard in the RootLayout component that helps prevent most hydration issues
- If errors persist, try clearing your browser cache and cookies
- Using a private/incognito browser window can also help with persistent issues

### Error: "player.cardStatuses.get is not a function"

This error occurs when the player card status is not properly formatted as a Map.

**Solution:**
- This is handled automatically in the GameContext component
- If errors persist, try refreshing the page
- In extreme cases, create a new game to reset the state

## Database Connection Issues

### Unable to Connect to Database

If you see database connection errors:

**Solution:**
1. Check that your `.env` file is properly configured with the correct DATABASE_URL
2. Verify your PostgreSQL server is running
3. Make sure you have run the database migrations:
   ```
   npx prisma migrate dev --name init
   ```
4. Try generating the Prisma client again:
   ```
   npx prisma generate
   ```

## Creating a New Game

### Game Setup Page Not Working

If the game setup page doesn't respond or submit:

**Solution:**
1. Make sure you've selected at least one card from each category (suspect, weapon, room)
2. Ensure you've specified which player is you (by selecting "This is me")
3. Each player must have a name
4. Try using the test page at `/test` to verify the basic interactivity is working

## Game Play Issues

### Suggestion Recording Not Working

If you can't record suggestions:

**Solution:**
1. Ensure you've selected all required fields: player making suggestion, responder, suspect, weapon, and room
2. The responder can't be the same player who made the suggestion
3. Try adding one suggestion at a time and wait for the UI to update

### Probability Card Not Showing

**Solution:**
1. Click the "Show Probability Card" button to display probabilities
2. Wait a moment for calculations to complete
3. If the card remains empty, try adding more suggestions to gather more information

## Browser Compatibility

The Cluedo Solver works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Internet Explorer is not supported.

## Still Having Issues?

If you're still experiencing problems, try these general troubleshooting steps:

1. Clear your browser cache and cookies
2. Restart your browser
3. Ensure your Node.js version is 18.0.0 or higher
4. Try reinstalling dependencies:
   ```
   npm ci
   ```
5. Restart the development server:
   ```
   npm run dev
   ```

## Contact Support

If you continue to experience issues, please file an issue on the GitHub repository with:
- A detailed description of the problem
- Steps to reproduce
- Your browser and operating system information
