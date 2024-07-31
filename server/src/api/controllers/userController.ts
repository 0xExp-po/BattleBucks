import { z } from "zod";
import { publicProcedure } from "../index";
import { prisma } from "../../app";
import { commonResponse } from "../../interfaces/MessageResponse";
import { User } from "@prisma/client";

const UserInputSchema = z.object({
  name: z.string().max(255),
  username: z.string(),
  phoneNo: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

const ProfileInputSchema = z.object({
  userId: z.string(),
});

const SearchInputSchema = z.object({
  search: z.string(),
  limit: z.number().default(10),
  offset: z.number().default(0),
});

const SearchOutputSchema = commonResponse(
  z
    .object({
      players: z.array(
        z.object({
          name: z.string().optional(),
          username: z.string().optional(),
        })
      ),
      total: z.number(),
    })
    .nullable()
);

export const createUser = publicProcedure
  .input(UserInputSchema)
  .output(commonResponse(UserInputSchema.nullable()))
  .mutation(async ({ input }): Promise<any> => {
    const { username, ...userData } = input;

    const isUserExist = await prisma.user.findUnique({ where: { username } });

    if (isUserExist) {
      return {
        status: 400,
        error: "User already exists",
      };
    }

    try {
      const user = await prisma.user.create({
        data: { username, ...userData },
      });

      return {
        status: 200,
        result: user,
      };
    } catch (error) {
      return {
        status: 400,
        result: null,
        error: "Something went wrong",
      };
    }
  });

export const getProfile = publicProcedure
  .input(ProfileInputSchema)
  .output(commonResponse(z.object({ user: z.any() }).nullable()))
  .query(async ({ input }): Promise<any> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) {
        return {
          status: 404,
          error: "User not found",
        };
      }
      return {
        status: 200,
        result: { user },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

// Other user controller functions...

export const searchPlayer = publicProcedure
  .input(SearchInputSchema)
  .output(SearchOutputSchema)
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
