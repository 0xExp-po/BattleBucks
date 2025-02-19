import { z } from "zod";
import { privateProcedure, publicProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import CryptoJS from "crypto-js";
import { TRPCError } from "@trpc/server";
import { generateToken, verifyTelegramLogin } from "../../utils/auth";
import { prisma } from "../../prisma";

// Define schemas for input validation
export const TelegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
});

export const TelegramInputSchema = z.object({
  initData: z.string(),
});

const UserSchema = z.object({
  name: z.string().max(255),
  username: z.string(),
  phoneNo: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
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

const UpdateProfileInputSchema = z.object({
  name: z.string().max(255).optional(),
  phoneNo: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

export const authenticateUser = publicProcedure
  .input(TelegramInputSchema)
  .output(commonResponse(z.object({ user: UserSchema, isNewUser: z.boolean(), token: z.string() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    const { initData } = input;
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyTelegramLogin(initData, process.env.TELEGRAM_BOT_TOKEN || "");
      if (!isValid) {
        return {
          status: 400,
          result: null,
          error: "Invalid Telegram data",
        };
      }
    }
    let parsedData;
    if (process.env.NODE_ENV !== "production") {
      parsedData = Object.fromEntries(new URLSearchParams(initData));
    } else {
      parsedData = JSON.parse(Object.fromEntries(new URLSearchParams(initData)).user);
    }
    const { id, first_name, last_name } = parsedData;
    try {
      let user = await prisma.user.findUnique({
        where: { telegramID: id.toString() },
      });
      let isNewUser = false;

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramID: id.toString(),
            name: `${first_name} ${last_name || ""}`.trim(),
            username: `user${id}`,
            profilePicture: "",
          },
        });
        isNewUser = true;
      }

      // Generate a token
      const token = generateToken(user.id);

      return {
        status: 200,
        result: { user, isNewUser, token },
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
  .input(z.void())
  .output(commonResponse(z.object({ user: UserSchema }).nullable()))
  .query(async ({ ctx }): Promise<any> => {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramID: ctx.user.telegramID },
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
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
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

// Update user profile
export const updateProfile = privateProcedure
  .input(UpdateProfileInputSchema)
  .output(commonResponse(z.object({ user: UserSchema }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      const updatedUser = await prisma.user.update({
        where: { telegramID: ctx.user.telegramID },
        data: {
          name: input.name,
          phoneNo: input.phoneNo,
          profilePicture: input.profilePicture,
          bio: input.bio,
        },
      });

      if (!updatedUser) {
        return {
          status: 404,
          error: "User not found",
        };
      }

      return {
        status: 200,
        result: { user: updatedUser },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getUserFriends = privateProcedure
  .output(commonResponse(z.object({ friends: z.array(UserSchema) }).nullable()))
  .query(async ({ ctx }): Promise<any> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { friends: true },
      });
      if (!user) {
        return {
          status: 404,
          error: "User not found",
        };
      }
      return {
        status: 200,
        result: { friends: user.friends },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getUserGameHistory = privateProcedure
  .output(
    commonResponse(z.object({ gameHistory: z.array(z.any()) }).nullable())
  )
  .query(async ({ ctx }): Promise<any> => {
    try {
      const gameHistory = await prisma.gameParticipant.findMany({
        where: { playerId: ctx.user.id },
        include: { game: true },
      });
      return {
        status: 200,
        result: { gameHistory },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });