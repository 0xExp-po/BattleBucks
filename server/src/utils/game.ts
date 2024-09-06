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

export async function advanceBracket(
  prisma: PrismaClient,
  gameId: string,
  round: number,
  winner: string
): Promise<{ eliminatedPlayers: string[]; nextRound: number | null; isGameOver: boolean }> {
  const currentMatchup = await prisma.bracket.findFirst({
    where: { gameId, round, OR: [{ player1Id: winner }, { player2Id: winner }] },
  });

  if (!currentMatchup) {
    throw new Error("Winner not found in the current round");
  }

  // Update the current bracket with the winner
  await prisma.bracket.update({
    where: { id: currentMatchup.id },
    data: { winnerId: winner },
  });

  const nextRound = round + 1;
  const nextPosition = Math.floor(currentMatchup.position / 2);

  // Check if next round bracket exists
  const nextRoundBracket = await prisma.bracket.findUnique({
    where: { gameId_round_position: { gameId, round: nextRound, position: nextPosition } },
  });

  if (nextRoundBracket) {
    // Advance winner to next round
    await prisma.bracket.update({
      where: { id: nextRoundBracket.id },
      data: {
        [nextRoundBracket.player1Id === null ? 'player1Id' : 'player2Id']: winner,
      },
    });
  }

  // Mark loser as eliminated
  const loser = currentMatchup.player1Id === winner ? currentMatchup.player2Id : currentMatchup.player1Id;
  
  if (loser) {
    await prisma.gameParticipant.update({
      where: { gameId_playerId: { gameId, playerId: loser } },
      data: { eliminated: true },
    });
  }

  // Check if the round is complete
  const roundComplete = await prisma.bracket.count({
    where: { gameId, round, winnerId: { not: null } },
  });

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { brackets: true },
  });

  if (!game) throw new Error("Game not found");

  const totalMatchesInRound = game.brackets.filter((b) => b.round === round).length;
  const isGameOver = nextRound > Math.log2(game.maxPlayers);

  if (roundComplete === totalMatchesInRound) {
    // Round is complete
    return {
      eliminatedPlayers: [loser!],
      nextRound: isGameOver ? null : nextRound,
      isGameOver,
    };
  } else {
    // Round is not complete yet
    return {
      eliminatedPlayers: [loser!],
      nextRound: null,
      isGameOver: false,
    };
  }
}

export function determineWinner(moves: { playerId: string; move: MoveType }[]): string | null {
  const [move1, move2] = moves;

  if (move1.move === move2.move) {
    // In case of a tie, return null to indicate a draw
    return null;
  }

  const rules: { [key in MoveType]: MoveType } = {
    ROCK: "SCISSORS",
    PAPER: "ROCK",
    SCISSORS: "PAPER",
  };

  return rules[move1.move] === move2.move ? move1.playerId : move2.playerId;
}

export async function fillBracket(prisma: PrismaClient, gameId: string, playerId: string): Promise<void> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { brackets: true },
  });

  if (!game) throw new Error("Game not found");

  const emptyBracket = game.brackets.find(b => b.round === 1 && (b.player1Id === null || b.player2Id === null));

  if (!emptyBracket) throw new Error("No empty bracket found");

  await prisma.bracket.update({
    where: { id: emptyBracket.id },
    data: {
      player1Id: emptyBracket.player1Id === null ? playerId : emptyBracket.player1Id,
      player2Id: emptyBracket.player1Id !== null ? playerId : emptyBracket.player2Id,
    },
  });
}

export async function getRank(prisma: PrismaClient, gameId: string, playerId: string): Promise<number> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { participants: true },
  });

  if (!game) throw new Error("Game not found");

  const eliminatedPlayers = game.participants.filter(p => p.eliminated).length;
  const totalPlayers = game.participants.length;

  return totalPlayers - eliminatedPlayers + 1;
}
