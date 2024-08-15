export function determineWinner(
  gameLogs: { playerId: string; move: string }[]
): { remainingPlayers: string[], eliminatedPlayers: string[] } | 'draw' {
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

  // Initialize maps to track wins and losses
  const winCounts: { [key: string]: number } = {};
  const lossCounts: { [key: string]: number } = {};

  // Iterate over all possible matchups
  for (let i = 0; i < gameLogs.length; i++) {
    for (let j = i + 1; j < gameLogs.length; j++) {
      const player1 = gameLogs[i];
      const player2 = gameLogs[j];

      if (player1.move === player2.move) {
        continue; // It's a tie for this round
      }

      if (rules[player1.move] === player2.move) {
        // Player 1 wins, Player 2 loses
        winCounts[player1.playerId] = (winCounts[player1.playerId] || 0) + 1;
        lossCounts[player2.playerId] = (lossCounts[player2.playerId] || 0) + 1;
      } else {
        // Player 2 wins, Player 1 loses
        winCounts[player2.playerId] = (winCounts[player2.playerId] || 0) + 1;
        lossCounts[player1.playerId] = (lossCounts[player1.playerId] || 0) + 1;
      }
    }
  }

  // Determine the players who are eliminated (lost all matchups)
  const eliminatedPlayers = Object.keys(lossCounts).filter(
    playerId => lossCounts[playerId] === gameLogs.length - 1
  );

  // Determine remaining players (not eliminated)
  const remainingPlayers = gameLogs
    .map(log => log.playerId)
    .filter(playerId => !eliminatedPlayers.includes(playerId));

  // If all remaining players are eliminated, it's a draw
  if (remainingPlayers.length === 0) {
    return 'draw';
  }

  return { remainingPlayers, eliminatedPlayers };
}
