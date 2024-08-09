export type Child = React.ReactElement | string | number;

export type Children = Child | (Child | Children)[];

export enum LanguageString {
  welcomeBack = "welcomeBack",
};

export type Language = {
  NAME: string;
  welcomeBack: string;
};

export type Game = {
  id: string;
  gameType: "v1v1" | "BattleRoyale"
  maxPlayers: number;
  buyIn: 1
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}
