import { z } from "zod";
import { privateProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import { prisma } from "../../prisma";
import { FriendStatus } from "@prisma/client";

const FriendRequestSchema = z.object({
  friendId: z.string(),
});

const FriendResponseSchema = z.object({
  requestId: z.number(),
});

const GetFriendsListSchema = z.object({
  limit: z.number().default(10),
  offset: z.number().default(0),
});

export const sendFriendRequest = privateProcedure
  .input(FriendRequestSchema)
  .output(commonResponse(z.object({ request: z.any() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      const request = await prisma.friend.create({
        data: {
          userId: ctx.user.id,
          friendId: input.friendId,
          status: FriendStatus.PENDING,
        },
      });
      return {
        status: 200,
        result: { request },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const acceptFriendRequest = privateProcedure
  .input(FriendResponseSchema)
  .output(commonResponse(z.object({ friend: z.any() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      const friend = await prisma.friend.update({
        where: { id: input.requestId, friendId: ctx.user.id, status: FriendStatus.PENDING },
        data: { status: FriendStatus.ACCEPTED },
      });
      return {
        status: 200,
        result: { friend },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const rejectFriendRequest = privateProcedure
  .input(FriendResponseSchema)
  .output(commonResponse(z.object({ friend: z.any() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      const friend = await prisma.friend.update({
        where: { id: input.requestId, friendId: ctx.user.id, status: FriendStatus.PENDING },
        data: { status: FriendStatus.REJECTED },
      });
      return {
        status: 200,
        result: { friend },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getFriendsList = privateProcedure
  .input(GetFriendsListSchema)
  .output(commonResponse(z.object({ friends: z.array(z.any()), total: z.number() }).nullable()))
  .query(async ({ input, ctx }): Promise<any> => {
    try {
      const friends = await prisma.friend.findMany({
        where: { 
          OR: [
            { userId: ctx.user.id, status: FriendStatus.ACCEPTED },
            { friendId: ctx.user.id, status: FriendStatus.ACCEPTED }
          ]
        },
        include: {
          user: true,
          friend: true,
        },
        take: input.limit,
        skip: input.offset,
      });

      const total = await prisma.friend.count({
        where: { 
          OR: [
            { userId: ctx.user.id, status: FriendStatus.ACCEPTED },
            { friendId: ctx.user.id, status: FriendStatus.ACCEPTED }
          ]
        },
      });

      return {
        status: 200,
        result: { 
          friends: friends.map(f => f.userId === ctx.user.id ? f.friendId : f.userId),
          total 
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
