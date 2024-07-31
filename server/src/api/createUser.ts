import { publicProcedure } from ".";
import { z } from "zod";
import { prisma } from "../app";
import { commonResponse } from "../interfaces/MessageResponse";

const userSchema = z.object({
  name: z.string(),
  username: z.string(),
  phoneNo: z.string().nullable(),
  profilePicture: z.string().nullable(),
  bio: z.string().nullable(),
});

export const createUser = publicProcedure
  .input(userSchema)
  .output(commonResponse(userSchema.nullable()))
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
