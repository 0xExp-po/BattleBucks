// import { z } from "zod";

// import { publicProcedure, router } from "./index";
// import { createUser } from "./createUser";
// import { newMatch } from "./newMatch";
// import { gamePlay } from "./gamePlay";
// import { updateWinner } from "./updateWinner";
// import { searchPlayer } from "./searchPlayer";
// import { getProfile } from "./getProfile";

// // combined router
// export const appRouter = router({
//     test: publicProcedure
//         .input(
//             z.object({
//                 hello: z.string(),
//             })
//         ).output(z.string())
//         .query((req) => {
//             const helloValue = req.input.hello; // string
//             console.log(helloValue);
//             return helloValue;
//         }),
//     createUser: createUser,
//     newMatch: newMatch,
//     getProfile: getProfile,
//     searchPlayer: searchPlayer,
//     // gamePlay: gamePlay,
//     // updateWinner: updateWinner,
//     // sample: sampleRouter,
// });

// // type definition of trpc API
// export type AppRouter = typeof appRouter;


import { router } from "./index";
import gameRouter from "./routes/game";
import userRouter from "./routes/user";

export const appRouter = router({
  game: gameRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
