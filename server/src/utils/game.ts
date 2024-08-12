export function determineWinner(
  gameLogs: { playerId: string; move: string }[]
): { playerId: string } | null {
  // Validate input
  if (gameLogs.length < 2) {
    throw new Error("At least two players are required to determine a winner.");
  }

  // Define the rules of the game
  const rules: { [key: string]: string } = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  // Initialize a map to track wins
  const winCounts: { [key: string]: number } = {};

  // Iterate over all possible matchups
  for (let i = 0; i < gameLogs.length; i++) {
    for (let j = i + 1; j < gameLogs.length; j++) {
      const player1 = gameLogs[i];
      const player2 = gameLogs[j];

      if (player1.move === player2.move) {
        continue; // It's a tie for this round
      }

      if (rules[player1.move] === player2.move) {
        // Player 1 wins
        winCounts[player1.playerId] = (winCounts[player1.playerId] || 0) + 1;
      } else {
        // Player 2 wins
        winCounts[player2.playerId] = (winCounts[player2.playerId] || 0) + 1;
      }
    }
  }

  // Determine the player with the most wins
  let winner: { playerId: string } | null = null;
  let maxWins = 0;

  for (const playerId in winCounts) {
    if (winCounts[playerId] > maxWins) {
      maxWins = winCounts[playerId];
      winner = { playerId };
    } else if (winCounts[playerId] === maxWins) {
      winner = null; // If there's a tie in win counts, return null (no clear winner)
    }
  }

  return winner;
}
