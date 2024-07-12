import { z } from "zod";

export const commonResponse = <T extends z.ZodTypeAny>(resultSchema: T) => z.object({
  status: z.number(),
  result: resultSchema.optional(),
  error: z.string().optional()
});