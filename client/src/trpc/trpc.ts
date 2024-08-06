import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/api/router";

// express types give me errors here, fix needed?
export const trpc = createTRPCReact<AppRouter>();
