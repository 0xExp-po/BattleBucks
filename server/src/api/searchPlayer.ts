import { z } from "zod";
import { publicProcedure } from ".";
import { prisma } from "../app";
import { commonResponse } from "../interfaces/MessageResponse";

const inputSchema = z.object({
  search: z.string(),
  limit: z.number().default(10),
  offset: z.number().default(0),
});

const outputSchema = commonResponse(
  z.object({
    players: z.array(
      z.object({
        name: z.string().optional(),
        username: z.string().optional(),
      })
    ),
    total: z.number(),
  }).nullable()
);

export const searchPlayer = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input: { search, limit, offset } }): Promise<any> => {
    const searchResult = await prisma.user.findMany({
      select: {
        name: true,
        username: true,
      },
      where: {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
        ],
      },
      take: limit,
      skip: offset,
    });

    return {
      status: 200,
      result: {
        players: searchResult,
        total: searchResult.length,
      },
    };
  });
