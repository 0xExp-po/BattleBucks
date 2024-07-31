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

export const createUser = publicProcedure
  .input(UserInputSchema)
  .output(commonResponse(z.object({ user: z.any() }).nullable()))
  .mutation(async ({ input }): Promise<any> => {
    try {
      const user = await prisma.user.create({
        data: input,
      });
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