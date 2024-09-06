import { PrismaClient, MoveType } from "@prisma/client";

export function createBracket(playerCount: number): { round: number; position: number; player1Id: string | null; player2Id: string | null }[] {
  const rounds = Math.log2(playerCount);
  const bracket = [];

  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = playerCount / Math.pow(2, round);
    for (let position = 0; position < matchesInRound; position++) {
      bracket.push({
        round,
        position,
        player1Id: null,
        player2Id: null,
      });
    }
  }

  return bracket;
}

export async function advanceBracket(prisma: PrismaClient, gameId: string, round: number, winner: string): Promise<void> {
  const currentMatchup = await prisma.bracket.findFirst({
    where: { gameId, round, OR: [{ player1Id: winner }, { player2Id: winner }] },
  });

  if (!currentMatchup) {
    throw new Error("Winner not found in the current round");
  }

  const nextRound = round + 1;
  const nextPosition = Math.floor(currentMatchup.position / 2);

  await prisma.bracket.update({
    where: { gameId_round_position: { gameId, round: nextRound, position: nextPosition } },
    data: {
      [currentMatchup.position % 2 === 0 ? 'player1Id' : 'player2Id']: winner,
    },
  });
}

export function determineWinner(moves: { playerId: string; move: MoveType }[]): string {
  const [move1, move2] = moves;

  if (move1.move === move2.move) {
    // In case of a tie, randomly choose a winner
    return Math.random() < 0.5 ? move1.playerId : move2.playerId;
  }

  const rules: { [key in MoveType]: MoveType } = {
    ROCK: "SCISSORS",
    PAPER: "ROCK",
    SCISSORS: "PAPER",
  };

  return rules[move1.move] === move2.move ? move1.playerId : move2.playerId;
}
