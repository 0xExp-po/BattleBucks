export const userStatus: Record<
  string,
  {
    status: "ONLINE" | "GAMING" | "OFFLINE";
    userId?: string;
    gameId?: string;
    socketId?: string;
  }
> = {};
