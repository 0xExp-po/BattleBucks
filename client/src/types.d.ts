type Child = React.ReactElement | string | number;

type Children = Child | (Child | Children)[];

type Language = {
  NAME: string;
  welcomeBack: string;
};

type Participant = {
  gameParticipant: {
    createdAt: string,
    gameId: string,
    id: number,
    playerId: string,
    updatedAt: string,
  },
  playerId: string,
}

type Game = {
  id: string,
  buyIn: number,
  gameType: "v1v1" | "BattleRoyale",
  maxPlayers: 8,
  status: "OPEN" | "CLOSED",
  participants: Participant[],
  eliminatedPlayersCnt: 0,
  winner: null,
  createdAt: string,
  updatedAt: string,
}
