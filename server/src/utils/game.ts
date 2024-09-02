export function determineWinner(gameLogs: { playerId: string; move: string }[]): { remainingPlayers: string[]; eliminatedPlayers: string[] } {
  // Validate input
  if (gameLogs.length < 2) {
    throw new Error("At least two players are required to determine a winner.");
  }

  // Define the rules of the game
  const rules: { [key: string]: string } = {
    ROCK: "SCISSORS",
    PAPER: "ROCK",
    SCISSORS: "PAPER",
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
  console.log("winCounts", winCounts);
  console.log("lossCounts", lossCounts);

  // Determine the players who are eliminated (lost all matchups)
  const remainingPlayers = Object.keys(winCounts).filter((playerId) => winCounts[playerId] > 0);

  // Determine remaining players (not eliminated)
  const eliminatedPlayers = gameLogs.map((log) => log.playerId).filter((playerId) => !remainingPlayers.includes(playerId));

  return { remainingPlayers, eliminatedPlayers };
}
