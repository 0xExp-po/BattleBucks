import { z } from "zod";
import { publicProcedure } from ".";

export const getProfile = publicProcedure.output(z.string()).query((req) => {
    return "Hello World";
});