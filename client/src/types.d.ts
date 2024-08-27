type Child = React.ReactElement | string | number;

type Children = Child | (Child | Children)[];

type Language = {
  NAME: string;
  welcomeBack: string;
};

type Game = {
  id: string,
  buyIn: number,
  gameType: "v1v1" | "BattleRoyale",
  maxPlayers: 8,
  status: "OPEN" | "CLOSED",
  participants: [],
  eliminatedPlayersCnt: 0,
  winner: null,
  createdAt: string,
  updatedAt: string,
}
