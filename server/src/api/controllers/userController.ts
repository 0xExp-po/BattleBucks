import { z } from "zod";
import { privateProcedure, publicProcedure } from "../index";
import { prisma } from "../../app";
import { commonResponse } from "../../interfaces/MessageResponse";
import CryptoJS from "crypto-js";
import { TRPCError } from "@trpc/server";

// Define schemas for input validation
const TelegramInputSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

const UserSchema = z.object({
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

export const loginOrRegisterUser = privateProcedure
  .input(TelegramInputSchema)
  .output(
    commonResponse(
      z.object({ user: UserSchema, isNewUser: z.boolean() }).nullable()
    )
  )
  .mutation(async ({ input, ctx }): Promise<any> => {
    const { id, first_name, last_name, username, photo_url } = input;

    // Verify the authentication data
    if (!ctx.user.isLoggedIn) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    try {
      let user = await prisma.user.findUnique({ where: { id: id.toString() } });
      let isNewUser = false;

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: id.toString(),
            name: `${first_name} ${last_name || ""}`.trim(),
            username: username || `user${id}`,
            profilePicture: photo_url,
          },
        });
        isNewUser = true;
      }

      return {
        status: 200,
        result: { user, isNewUser },
      };
    } catch (error) {
      return {
        status: 400,
        result: null,
        error: "Something went wrong",
      };
    }
  });

// Get user profile
export const getProfile = privateProcedure
  .input(ProfileInputSchema)
  .output(commonResponse(z.object({ user: UserSchema }).nullable()))
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

// Search for players
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
