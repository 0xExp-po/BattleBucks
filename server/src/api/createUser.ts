import { publicProcedure } from ".";
import { z } from "zod";
import { prisma } from "../app";

// Common Response Schema
const commonResponse = <T extends z.ZodTypeAny>(resultSchema: T) => z.object({
    status: z.number(),
    result: resultSchema.optional(),
    error: z.string().optional()
});

export const createUser = publicProcedure.input(z.object({
    name: z.string(),
    username: z.string(),
    phoneNo: z.string().nullable(),
    profilePicture: z.string().nullable(),
    bio: z.string().nullable(),
})).output(commonResponse(z.object({
    name: z.string(),
    username: z.string(),
    phoneNo: z.string().nullable(),
    profilePicture: z.string().nullable(),
    bio: z.string().nullable(),
}))).mutation(async (req): Promise<any> => {
    const { name, username, phoneNo, profilePicture, bio } = req.input;
    const isUserExist = await prisma.user.findUnique({ where: { username } });

    if (isUserExist) {
        return {
            status: 400,
            error: "User already exist"
        }
    }

    const user = await prisma.user.create({
        data: {
            name,
            username,
            phoneNo,
            profilePicture,
            bio
        }
    });

    return {
        status: 200,
        result: user
    }
})